import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { translate } from '$lib/i18n';
import { exportAsPNG, exportAsSVG, exportPDF } from '$lib/utils/export';
import { exportDWG, exportDXF } from '$lib/utils/cadExport';
import { exportNotice, exportPNGWithFeedback, exportPDFWithFeedback, exportSVGWithFeedback, exportDXFWithFeedback, exportDWGWithFeedback } from '$lib/stores/exportNotice';
import { layerVisibility } from '$lib/stores/project';
import { roomProject } from './fixtures/project';

vi.mock('$lib/utils/export', () => ({ exportAsPNG: vi.fn(), exportAsSVG: vi.fn(), exportPDF: vi.fn() }));
vi.mock('$lib/utils/cadExport', () => ({ exportDXF: vi.fn(), exportDWG: vi.fn() }));

const previousLayers = get(layerVisibility);
beforeEach(() => {
  for (const mock of [exportAsPNG, exportAsSVG, exportPDF, exportDXF, exportDWG]) vi.mocked(mock).mockReset();
  vi.mocked(exportAsPNG).mockResolvedValue(true); vi.mocked(exportPDF).mockResolvedValue({ omitted3D: false });
  for (const mock of [exportAsSVG, exportDXF, exportDWG]) vi.mocked(mock).mockReturnValue(true);
  exportNotice.set(null);
});
afterEach(() => layerVisibility.set(previousLayers));

/** A floor labelled with notes only, the kind of floor whose content can all be hidden. */
function notesOnly() {
  const project = roomProject(), floor = project.floors[0];
  floor.walls = [];
  floor.textAnnotations = [{ id: 'label', x: 0, y: 0, text: 'Driveway', fontSize: 16, color: '#1e293b', rotation: 0 }];
  return project;
}

const wrappers = [
  ['PNG', () => exportPNGWithFeedback(notesOnly()), exportAsPNG, "Não foi possível exportar o PNG 2D", 'Não foi possível exportar o PNG 2D'],
  ['PDF', () => exportPDFWithFeedback(notesOnly()), exportPDF, "Não foi possível exportar o PDF", 'Não foi possível exportar o PDF'],
  ['SVG', () => exportSVGWithFeedback(notesOnly()), exportAsSVG, "Não foi possível exportar o SVG", 'Não foi possível exportar o SVG'],
  ['DXF', () => exportDXFWithFeedback(notesOnly()), exportDXF, "Não foi possível exportar o DXF", 'Não foi possível exportar o DXF'],
  ['DWG', () => exportDWGWithFeedback(notesOnly()), exportDWG, "Não foi possível exportar o DWG", 'Não foi possível exportar o DWG'],
] as const;

it.each(wrappers)('explains a %s export whose floor content is all on hidden layers instead of asking for content', async (_format, run, exporter, title, portugueseTitle) => {
  layerVisibility.update(v => ({ ...v, textAnnotations: false }));
  await run();
  expect(exporter).not.toHaveBeenCalled();
  const notice = get(exportNotice)!;
  expect(translate('pt', notice.title)).toBe(title);
  expect(translate('pt', notice.message)).toBe(translate('pt', 'exportNotice.allHidden'));
  expect(translate('pt', notice.title)).toBe(portugueseTitle);
  expect(translate('pt', notice.message)).toContain('Camadas');
});

it.each(wrappers)('exports the %s as before once a layer with content is shown again', async (_format, run, exporter) => {
  layerVisibility.update(v => ({ ...v, furniture: false }));
  await run();
  expect(exporter).toHaveBeenCalledOnce();
  expect(get(exportNotice)?.message).not.toBe('exportNotice.allHidden');
});
