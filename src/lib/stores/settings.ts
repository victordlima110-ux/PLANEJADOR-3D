import { get, writable } from 'svelte/store';

/** Unidade de medida. O programa é métrico: metros e centímetros. */
export type Units = 'metric';

export interface ProjectSettings {
  units: Units;                          // metros e centímetros
  showDimensions: boolean;               // wall length labels
  showExternalDimensions: boolean;       // outside-wall dimensions
  showInternalDimensions: boolean;       // inside-room dimensions
  showExtensionLines: boolean;           // perpendicular tick marks on dimension lines
  showObjectDistance: boolean;            // distance from objects to walls
  dimensionLineColor: string;            // color for dimension lines/text
  wallMeasureMode: 'centerline' | 'edge'; // measure walls center-to-center or edge-to-edge (clear span)
  snapToGrid: boolean;                   // snap elements to grid when dragging
  snapToWalls: boolean;                  // snap furniture to nearby walls when dragging
  gridSize: number;                      // grid snap size in cm (default 25)
}

export const defaultSettings: ProjectSettings = {
  units: 'metric',
  showDimensions: true,
  showExternalDimensions: true,
  showInternalDimensions: true,
  showExtensionLines: true,
  showObjectDistance: true,
  dimensionLineColor: '#1e293b',
  wallMeasureMode: 'edge',
  snapToGrid: true,
  snapToWalls: true,
  gridSize: 10,
};

// Load from localStorage if available
function loadSettings(): ProjectSettings {
  if (typeof window === 'undefined') return { ...defaultSettings };
  try {
    const saved = localStorage.getItem('o3d_settings_br');
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {}
  return { ...defaultSettings };
}

// Called once the store holds the change, so blocked or full storage cannot cancel it; it then lasts until reload.
function persist(value: ProjectSettings) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('o3d_settings_br', JSON.stringify(value)); } catch { /* Storage can be disabled or full. */ }
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<ProjectSettings>(loadSettings());

  return {
    subscribe,
    set(value: ProjectSettings) {
      set(value);
      persist(value);
    },
    update(fn: (s: ProjectSettings) => ProjectSettings) {
      update(fn);
      persist(get({ subscribe }));
    },
    reset() {
      this.set({ ...defaultSettings });
    },
  };
}

export const projectSettings = createSettingsStore();

/** Converte cm para texto de exibição (m acima de 1 m, cm abaixo). */
export function formatLength(cm: number, _units: Units = 'metric'): string {
  if (cm >= 100) {
    const m = cm / 100;
    if (m % 1 === 0) return `${m} m`;
    return `${parseFloat(m.toFixed(2))} m`;
  }
  return `${Math.round(cm)} cm`;
}

/** Converte cm para texto de exibição com precisão total. */
export function formatLengthPrecise(cm: number, _units: Units = 'metric'): string {
  if (cm >= 100) {
    return `${(cm / 100).toFixed(2)} m`;
  }
  return `${cm.toFixed(1)} cm`;
}

/** Formata a área em metros quadrados. */
export function formatArea(m2: number, _units: Units = 'metric'): string {
  return `${m2.toFixed(1)} m²`;
}

/**
 * Lê o que a pessoa digitou e devolve em centímetros.
 * Aceita vírgula como separador decimal ("2,5 m") e os sufixos mm, cm e m.
 * Sem sufixo, o número é lido em centímetros.
 */
export function parseLengthInput(input: string, _units: Units = 'metric'): number | null {
  const text = input.trim().toLowerCase().replace(',', '.');
  const number = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
  const value = text.match(new RegExp(`^(${number})\\s*(mm|cm|m)?$`));
  if (!value) return null;
  const suffix = value[2];
  const factor = suffix === 'm' ? 100 : suffix === 'mm' ? .1 : 1;
  const cm = Number(value[1]) * factor;
  return Number.isFinite(cm) ? cm : null;
}
