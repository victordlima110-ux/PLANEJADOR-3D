import { writable } from 'svelte/store';
import type { Locale, TranslationKey } from '$lib/i18n';
import type { Project } from '$lib/models/types';
import { exportAsPNG, exportAsSVG, exportPDF } from '$lib/utils/export';
import { exportDWG, exportDXF } from '$lib/utils/cadExport';
import { interchangeFileName, projectToPreparedRoomPlan, sortedJson } from '$lib/utils/interchange';
import { planContentHidden } from '$lib/utils/exportVisibility';
import { currentPlanExportVisibility } from './planVisibility';

/** The published user guide, linked from the editor, its shortcuts dialog and the library. */
export const USER_GUIDE_URL = 'https://github.com/victordlima110-ux/PLANEJADOR-3D/blob/main/docs/guia-do-usuario.md';

export const exportNotice = writable<{ title: TranslationKey; message: TranslationKey } | null>(null);

/** Plan exports follow the 2D view's layers; a floor whose every item is hidden gets this notice instead of an empty file. */
function noticeHiddenContent(project: Project, title: TranslationKey): boolean {
  const floor = project.floors.find(f => f.id === project.activeFloorId) ?? project.floors[0];
  if (!planContentHidden(floor, currentPlanExportVisibility())) return false;
  exportNotice.set({ title, message: 'exportNotice.allHidden' });
  return true;
}

/** Both PDF entry points use the same outcome reporting; the sheet's labels follow `language`. */
export async function exportPDFWithFeedback(project: Project, language: Locale = 'pt') {
  exportNotice.set(null);
  if (noticeHiddenContent(project, 'exportNotice.pdfTitle')) return;
  try {
    const result = await exportPDF(project, language);
    if (!result) {
      exportNotice.set({ title: 'exportNotice.pdfTitle', message: 'exportNotice.pdfEmpty' });
    } else if (result.omitted3D) {
      exportNotice.set({ title: 'exportNotice.pdfPartial', message: 'exportNotice.pdfPartialHelp' });
    }
  } catch {
    exportNotice.set({ title: 'exportNotice.pdfTitle', message: 'exportNotice.pdfFailed' });
  }
}

export async function exportPNGWithFeedback(project: Project) {
  exportNotice.set(null);
  if (noticeHiddenContent(project, 'exportNotice.pngTitle')) return;
  try {
    if (!await exportAsPNG(null, project)) exportNotice.set({ title: 'exportNotice.pngTitle', message: 'exportNotice.pngEmpty' });
  } catch {
    exportNotice.set({ title: 'exportNotice.pngTitle', message: 'exportNotice.pngFailed' });
  }
}

/** Like PNG and PDF, the vector and CAD exports explain an empty floor or a failure instead of doing nothing; labels follow `language`. */
export function exportSVGWithFeedback(project: Project, language: Locale = 'pt') {
  exportNotice.set(null);
  if (noticeHiddenContent(project, 'exportNotice.svgTitle')) return;
  try {
    if (!exportAsSVG(project, language)) exportNotice.set({ title: 'exportNotice.svgTitle', message: 'exportNotice.svgEmpty' });
  } catch {
    exportNotice.set({ title: 'exportNotice.svgTitle', message: 'exportNotice.svgFailed' });
  }
}

/** CAD exports also say when the floor's only content is entourage they cannot draw, rather than asking for content. */
export function exportDXFWithFeedback(project: Project, language: Locale = 'pt') {
  exportNotice.set(null);
  if (noticeHiddenContent(project, 'exportNotice.dxfTitle')) return;
  try {
    const result = exportDXF(project, language);
    if (result !== true) exportNotice.set({ title: 'exportNotice.dxfTitle', message: result === 'unsupported' ? 'exportNotice.dxfUnsupported' : 'exportNotice.dxfEmpty' });
  } catch {
    exportNotice.set({ title: 'exportNotice.dxfTitle', message: 'exportNotice.dxfFailed' });
  }
}

/** There is no DWG writer: the DXF downloads and the notice says so instead of a blocking alert. */
export function exportDWGWithFeedback(project: Project, language: Locale = 'pt') {
  exportNotice.set(null);
  if (noticeHiddenContent(project, 'exportNotice.dwgErrorTitle')) return;
  try {
    const result = exportDWG(project, language);
    exportNotice.set(result === true
      ? { title: 'exportNotice.dwgTitle', message: 'exportNotice.dwgFallback' }
      : { title: 'exportNotice.dwgErrorTitle', message: result === 'unsupported' ? 'exportNotice.dwgUnsupported' : 'exportNotice.dwgEmpty' });
  } catch {
    exportNotice.set({ title: 'exportNotice.dwgErrorTitle', message: 'exportNotice.dwgFailed' });
  }
}

/** Salva a planta como JSON RoomPlan preparado, o formato de intercâmbio do aplicativo. */
export function downloadInterchangeJson(project: Project) {
  const blob = new Blob([sortedJson(projectToPreparedRoomPlan(project), 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url; link.download = interchangeFileName(project); link.click();
  } finally { URL.revokeObjectURL(url); }
}
