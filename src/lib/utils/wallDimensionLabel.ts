import { wallEdgeInsets } from './canvasRenderer';
import { wallPlanDimension } from './wallPlanGeometry';
import type { Point, Wall } from '$lib/models/types';

/** Wall length label for plan exports, following the editor's "Measure walls"
 * setting (issue #106). Edge mode shortens a straight wall by the half-thickness
 * of abutting walls and centres the label on that clear span; curved walls and
 * centreline mode keep the faceted centreline dimension.
 */
export function wallDimensionLabel(wall: Wall, walls: Wall[], mode: 'centerline' | 'edge'): { length: number; point: Point } {
  if (mode !== 'edge' || wall.curvePoint) return wallPlanDimension(wall);
  const dx = wall.end.x - wall.start.x, dy = wall.end.y - wall.start.y, length = Math.hypot(dx, dy);
  const inset = wallEdgeInsets(wall, walls), ux = length ? dx / length : 0, uy = length ? dy / length : 0;
  const start = { x: wall.start.x + ux * inset.start, y: wall.start.y + uy * inset.start };
  const end = { x: wall.end.x - ux * inset.end, y: wall.end.y - uy * inset.end };
  return { length: Math.round(Math.max(0, length - inset.start - inset.end)),
    point: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - 8 } };
}

/**
 * Quanto a medida escrita na planta é menor do que o comprimento da parede.
 *
 * No modo "face a face" — o padrão — a planta escreve o vão livre: o
 * comprimento da parede menos a meia espessura de cada parede que cruza nas
 * pontas. Uma parede de 12,15 m entre duas paredes de 15 cm aparece como
 * 12 m, que é a medida que o pedreiro vai usar.
 *
 * Essa diferença precisa ser conhecida em outros lugares além do desenho: o
 * campo de comprimento das propriedades mostra e aceita a mesma medida da
 * planta, senão seria preciso digitar 1215 para ver 1200.
 */
export function recuoDaMedida(wall: Wall, walls: Wall[], mode: 'centerline' | 'edge'): number {
  if (mode !== 'edge' || wall.curvePoint) return 0;
  const recuos = wallEdgeInsets(wall, walls);
  return recuos.start + recuos.end;
}
