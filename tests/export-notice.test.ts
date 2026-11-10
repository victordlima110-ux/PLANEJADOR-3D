import { beforeEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { translate, type Locale } from '$lib/i18n';
function notice(language: Locale = 'pt') {
 const value = get(exportNotice);
 return value && { title: translate(language, value.title), message: translate(language, value.message) };
}
import type { Project } from '$lib/models/types';
import { exportAsPNG, exportAsSVG, exportPDF } from '$lib/utils/export';
import { exportDWG, exportDXF } from '$lib/utils/cadExport';
import { exportNotice, exportPNGWithFeedback, exportPDFWithFeedback, exportSVGWithFeedback, exportDXFWithFeedback, exportDWGWithFeedback } from '$lib/stores/exportNotice';
import { roomProject } from './fixtures/project';
vi.mock('$lib/utils/export', () => ({ exportAsPNG: vi.fn(), exportAsSVG: vi.fn(), exportPDF: vi.fn() }));
vi.mock('$lib/utils/cadExport', () => ({ exportDXF: vi.fn(), exportDWG: vi.fn() }));
beforeEach(() => { for (const mock of [exportPDF, exportAsSVG, exportDXF, exportDWG]) vi.mocked(mock).mockReset(); exportNotice.set(null); });
it('reports an unavailable optional 3D view and clears the notice on a complete export', async () => {
 vi.mocked(exportPDF).mockResolvedValue({omitted3D:true}); await exportPDFWithFeedback(roomProject());
 expect(notice()?.title).toBe('PDF exportado sem a vista 3D');
 vi.mocked(exportPDF).mockResolvedValue({omitted3D:false}); await exportPDFWithFeedback(roomProject());
 expect(get(exportNotice)).toBeNull();
});
it('contains required export failures and reports empty floors', async () => {
 vi.mocked(exportPDF).mockRejectedValue(new Error('private implementation details'));
 await expect(exportPDFWithFeedback(roomProject())).resolves.toBeUndefined();
 expect(notice()?.title).toBe("Não foi possível exportar o PDF");
 expect(notice()?.message).not.toContain('private');
 vi.mocked(exportPDF).mockResolvedValue(undefined); await exportPDFWithFeedback(roomProject());
 expect(notice()?.message).toContain('Adicione paredes');
});

it('reports asynchronous PNG encoding failures and empty floors', async()=>{
 vi.mocked(exportAsPNG).mockRejectedValue(new Error('encoding failed'));
 await exportPNGWithFeedback(roomProject());expect(notice()?.title).toBe("Não foi possível exportar o PNG 2D");
 vi.mocked(exportAsPNG).mockResolvedValue(false);await exportPNGWithFeedback(roomProject());
 expect(notice()?.message).toContain('Adicione paredes');
 vi.mocked(exportAsPNG).mockResolvedValue(true);await exportPNGWithFeedback(roomProject());expect(get(exportNotice)).toBeNull();
});

/** SVG and DXF explain an empty floor and a failure like PNG and PDF, in the language they export with. */
function expectVectorFeedback<Result>(format: 'SVG' | 'DXF', portuguese: string,
 exporter: (project: Project, language?: Locale) => Result, withFeedback: (project: Project, language?: Locale) => void, empty: Result, downloaded: Result) {
 const project = roomProject();
 vi.mocked(exporter).mockReturnValue(empty); withFeedback(project, 'pt');
 expect(exporter).toHaveBeenCalledWith(project, 'pt');
 expect(notice()?.title).toBe(`Não foi possível exportar o ${format}`);
 expect(notice()?.message).toBe(`Adicione paredes, móveis, escadas, colunas, elementos de entorno, notas ou medidas ao piso ativo antes de exportar ${portuguese}.`);
 expect(notice('pt')?.message).toContain(`ao piso ativo antes de exportar ${portuguese}.`);
 vi.mocked(exporter).mockReturnValue(downloaded); withFeedback(project);
 expect(exporter).toHaveBeenLastCalledWith(project, 'pt');
 expect(get(exportNotice)).toBeNull();
 vi.mocked(exporter).mockImplementation(() => { throw new Error('private implementation details'); });
 expect(() => withFeedback(project)).not.toThrow();
 expect(notice()?.title).toBe(`Não foi possível exportar o ${format}`);
 expect(notice()?.message).toContain(`Não foi possível preparar o ${format}.`);
 expect(notice()?.message).not.toContain('private');
}
it('reports SVG empty floors and failures and clears the notice after a download', () => expectVectorFeedback('SVG', 'um SVG', exportAsSVG, exportSVGWithFeedback, false, true));
it('reports DXF empty floors and failures and clears the notice after a download', () => expectVectorFeedback('DXF', 'um DXF', exportDXF, exportDXFWithFeedback, 'empty', true));

it('keeps the DWG-as-DXF notice after a download and reports DWG empty floors and failures', () => {
 const project = roomProject();
 vi.mocked(exportDWG).mockReturnValue(true); exportDWGWithFeedback(project, 'pt');
 expect(exportDWG).toHaveBeenCalledWith(project, 'pt');
 expect(notice()?.title).toBe('DWG salvo como DXF');
 vi.mocked(exportDWG).mockReturnValue('empty'); exportDWGWithFeedback(project);
 expect(notice()?.title).toBe("Não foi possível exportar o DWG");
 expect(notice()?.message).toBe('Adicione paredes, móveis, escadas, colunas, elementos de entorno, notas ou medidas ao piso ativo antes de exportar um DWG.');
 expect(notice('pt')?.title).toBe('Não foi possível exportar o DWG');
 vi.mocked(exportDWG).mockImplementation(() => { throw new Error('private implementation details'); });
 expect(() => exportDWGWithFeedback(project)).not.toThrow();
 expect(notice()?.title).toBe("Não foi possível exportar o DWG");
 expect(notice()?.message).toContain('Não foi possível preparar o DWG.');
 expect(notice()?.message).not.toContain('private');
});

it('says DXF and DWG cannot include uploaded or transparent entourage instead of asking for content', () => {
 const project = roomProject();
 vi.mocked(exportDXF).mockReturnValue('unsupported'); exportDXFWithFeedback(project, 'pt');
 expect(exportDXF).toHaveBeenCalledWith(project, 'pt');
 expect(notice()).toEqual({ title: "Não foi possível exportar o DXF",
  message: "Um DXF não pode incluir símbolos de entorno enviados nem elementos de entorno com 0% de opacidade, e o piso ativo não tem mais nada para exportar. Exporte como SVG, PNG ou PDF em vez disso." });
 expect(notice('pt')?.message).toBe('Um DXF não pode incluir símbolos de entorno enviados nem elementos de entorno com 0% de opacidade, e o piso ativo não tem mais nada para exportar. Exporte como SVG, PNG ou PDF em vez disso.');
 vi.mocked(exportDWG).mockReturnValue('unsupported'); exportDWGWithFeedback(project);
 expect(notice()?.title).toBe("Não foi possível exportar o DWG");
 expect(notice()?.message).toContain('Um DWG não pode incluir símbolos de entorno enviados nem elementos de entorno com 0% de opacidade');
 expect(notice('pt')?.title).toBe('Não foi possível exportar o DWG');
 expect(notice('pt')?.message).toContain('Um DWG não pode incluir símbolos de entorno enviados');
});

it('keeps notice messages translatable after the export completes', async () => {
 vi.mocked(exportPDF).mockResolvedValue({ omitted3D: true });
 await exportPDFWithFeedback(roomProject());
 expect(notice('pt')?.title).toBe('PDF exportado sem a vista 3D');
 expect(notice('pt')?.title).toBe(translate('pt', 'exportNotice.pdfPartial'));
});
