import type { TranslationKey } from '$lib/i18n';
import { formatLength, type ProjectSettings } from '$lib/stores/settings';
import { SNAP } from '$lib/utils/canvasInteraction';

/**
 * O botão de encaixe da barra de status (S) só escolhe o passo para o qual o
 * encaixe arredonda: o tamanho da grade ou o passo fino.
 */
export function snapStepLabel(stepCm: number, units: ProjectSettings['units']): string {
  return formatLength(stepCm, units);
}

export interface SnapStatus { label: string; title: string; pressed: boolean }

/**
 * What the status-bar Snap button shows. While the top-bar Snap to Grid switch is on, it names the
 * step S picked and is pressed on the grid step. While the switch is off nothing rounds to a step,
 * so it reads "Snap off" and is not pressed; its title says S still picks the step used once the
 * switch is back on.
 */
export function snapStatus(
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string,
  snapping: { enabled: boolean; snapToGrid: boolean; gridSize: number },
  units: ProjectSettings['units'],
): SnapStatus {
  const grid = snapStepLabel(snapping.gridSize, units), fine = snapStepLabel(SNAP, units);
  const step = snapping.snapToGrid ? grid : fine;
  return snapping.enabled
    ? { label: t('canvasDisplay.snap', { step }), title: t('canvasDisplay.snapHint', { grid, fine }), pressed: snapping.snapToGrid }
    : { label: t('canvasDisplay.snapOff'), title: t('canvasDisplay.snapOffHint', { grid, fine, step }), pressed: false };
}
