import type { Point, Wall } from '$lib/models/types';

export type WallEndpoint = 'start' | 'end';
export const WALL_JOIN_TOLERANCE = 2; // cm; same joined-corner rule as pointer dragging
export const MIN_WALL_LENGTH = 1; // cm

export function wallLength(wall: Wall): number {
  if (!wall.curvePoint) return Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
  let length = 0, previous = wall.start;
  for (let i = 1; i <= 20; i++) {
    const t = i / 20, u = 1 - t;
    const point = { x: u * u * wall.start.x + 2 * u * t * wall.curvePoint.x + t * t * wall.end.x,
      y: u * u * wall.start.y + 2 * u * t * wall.curvePoint.y + t * t * wall.end.y };
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}

export function connectedWallEndpoints(walls: Wall[], point: Point, excludeWallId: string): { wallId: string; endpoint: WallEndpoint }[] {
  const results: { wallId: string; endpoint: WallEndpoint }[] = [];
  for (const wall of walls) {
    if (wall.id === excludeWallId) continue;
    for (const endpoint of ['start', 'end'] as const) {
      if (Math.hypot(wall[endpoint].x - point.x, wall[endpoint].y - point.y) < WALL_JOIN_TOLERANCE) {
        results.push({ wallId: wall.id, endpoint });
      }
    }
  }
  return results;
}

export function finitePoint(point: unknown): point is Point {
  return !!point && typeof point === 'object' && 'x' in point && 'y' in point && Number.isFinite(point.x) && Number.isFinite(point.y);
}

/** Plan all corner updates first, so a rejected resize cannot partly modify the floor. */
export function planWallResize(
  walls: Wall[], id: string, length: number, fixed: WallEndpoint = 'start',
  /** Mantém no eixo as paredes retas que encostam no canto que se move (ver planCornerTargets). */
  keepNeighboursStraight = true,
): Map<string, Partial<Wall>> {
  if (!Number.isFinite(length) || length < MIN_WALL_LENGTH) throw new Error('Wall length must be at least 1 cm.');
  if (fixed !== 'start' && fixed !== 'end') throw new Error('Choose a fixed wall endpoint.');
  const wall = walls.find(w => w.id === id);
  if (!wall) throw new Error('Select a wall to resize.');
  const currentLength = wallLength(wall);
  if (!Number.isFinite(currentLength) || currentLength < MIN_WALL_LENGTH) throw new Error('This wall is too short to resize. Move its endpoint first.');
  const changes = new Map<string, Partial<Wall>>();
  if (Math.abs(length - currentLength) < 1e-6) return changes;
  const moving: WallEndpoint = fixed === 'start' ? 'end' : 'start';
  const origin = wall[fixed], scale = length / currentLength;
  const transform = (p: Point): Point => ({ x: origin.x + (p.x - origin.x) * scale, y: origin.y + (p.y - origin.y) * scale });
  const target = transform(wall[moving]);
  changes.set(id, { [moving]: target, ...(wall.curvePoint ? { curvePoint: transform(wall.curvePoint) } : {}) });

  const plan = keepNeighboursStraight
    ? planCornerTargets(walls, id, wall[moving], wall[fixed], target)
    : null;

  if (plan) {
    for (const [index, landing] of plan.targets) {
      const corner = plan.corners[index];
      // Canto que não saiu do lugar não precisa de ajuste nenhum.
      if (Math.hypot(landing.x - corner.point.x, landing.y - corner.point.y) < MOVE_EPSILON) continue;
      for (const member of corner.members) {
        changes.set(member.wallId, { ...changes.get(member.wallId), [member.endpoint]: { ...landing } });
      }
    }
  } else {
    // Planta onde repassar não fecha: mexe só na ponta compartilhada, como antes.
    for (const connection of connectedWallEndpoints(walls, wall[moving], id)) {
      changes.set(connection.wallId, { ...changes.get(connection.wallId), [connection.endpoint]: { ...target } });
    }
  }
  for (const [wallId, updates] of changes) {
    const changed = { ...walls.find(w => w.id === wallId)!, ...updates };
    if (!finitePoint(changed.start) || !finitePoint(changed.end) || (changed.curvePoint && !finitePoint(changed.curvePoint)) || !Number.isFinite(wallLength(changed))) {
      throw new Error('This length would create invalid wall coordinates.');
    }
    if (Math.hypot(changed.end.x - changed.start.x, changed.end.y - changed.start.y) < MIN_WALL_LENGTH) {
      throw new Error('This length would collapse a joined wall. Choose another length or fixed endpoint.');
    }
  }
  return changes;
}

export function validPositiveDimension(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}
export function validOpeningPosition(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

/* ── Cantos e propagação do redimensionamento ────────────────────────────── */

/** Quanto um trecho pode fugir do eixo e ainda contar como reto (≈1°). */
const AXIS_TOLERANCE = 0.0175;
/** Deslocamento abaixo disto é ruído de arredondamento, não movimento. */
const MOVE_EPSILON = 1e-6;
/** Trava contra propagação sem fim em plantas muito emaranhadas. */
const MAX_PROPAGATION_STEPS = 500;

interface Corner { point: Point; members: { wallId: string; endpoint: WallEndpoint }[] }

/** Agrupa as pontas de parede que se encostam: cada grupo é um canto da planta. */
function buildCorners(walls: Wall[]): { corners: Corner[]; indexOf: (point: Point) => number } {
  const corners: Corner[] = [];
  const find = (point: Point) =>
    corners.findIndex(corner => Math.hypot(corner.point.x - point.x, corner.point.y - point.y) < WALL_JOIN_TOLERANCE);
  for (const wall of walls) {
    for (const endpoint of ['start', 'end'] as const) {
      const existing = find(wall[endpoint]);
      if (existing >= 0) corners[existing].members.push({ wallId: wall.id, endpoint });
      else corners.push({ point: { ...wall[endpoint] }, members: [{ wallId: wall.id, endpoint }] });
    }
  }
  return { corners, indexOf: find };
}

/**
 * Para onde cada canto da planta tem de ir para que as paredes retas continuem retas.
 *
 * Mover só a ponta compartilhada entorta a vizinha: num retângulo de 4×3,
 * esticar o lado de baixo para 5 deixaria a lateral em diagonal. Então o
 * movimento é repassado adiante — uma parede reta só muda de comprimento
 * quando o canto anda na direção dela, e quando anda de lado a parede inteira
 * acompanha, levando junto o canto do outro extremo.
 *
 * Devolve as posições finais, ou `null` quando repassar não fecha: o movimento
 * chegaria ao canto que está preso, ou chegaria contraditório a um canto já
 * resolvido. Nesse caso quem chama volta a mexer só na ponta, como antes.
 */
function planCornerTargets(
  walls: Wall[], resizedId: string, movingPoint: Point, fixedPoint: Point, target: Point,
): { corners: Corner[]; targets: Map<number, Point> } | null {
  const { corners, indexOf } = buildCorners(walls);
  const movingCorner = indexOf(movingPoint), pinnedCorner = indexOf(fixedPoint);
  if (movingCorner < 0 || pinnedCorner < 0) return null;

  const targets = new Map<number, Point>([
    [pinnedCorner, { ...corners[pinnedCorner].point }],
    [movingCorner, { ...target }],
  ]);
  const queue = [movingCorner];
  let steps = 0;

  while (queue.length) {
    if (++steps > MAX_PROPAGATION_STEPS) return null;
    const index = queue.shift()!;
    const from = corners[index], landing = targets.get(index)!;
    const move = { x: landing.x - from.point.x, y: landing.y - from.point.y };

    for (const member of from.members) {
      // A parede redimensionada já tem a outra ponta presa: nada a repassar.
      if (member.wallId === resizedId) continue;
      const wall = walls.find(w => w.id === member.wallId);
      // Parede curva não tem uma direção só para preservar.
      if (!wall || wall.curvePoint) continue;

      const far = member.endpoint === 'start' ? 'end' : 'start';
      const span = { x: wall[far].x - wall[member.endpoint].x, y: wall[far].y - wall[member.endpoint].y };
      const length = Math.hypot(span.x, span.y);
      if (length < MIN_WALL_LENGTH) continue;

      const direction = { x: span.x / length, y: span.y / length };
      // Só paredes na horizontal ou na vertical: numa diagonal, segurar o ângulo
      // espalha o movimento pela planta toda e quase sempre dá contradição.
      if (Math.abs(direction.x) > AXIS_TOLERANCE && Math.abs(direction.y) > AXIS_TOLERANCE) continue;

      // O quanto o canto andou na direção da parede vira comprimento; o resto a empurra inteira.
      const along = move.x * direction.x + move.y * direction.y;
      const reach = length - along;
      const landingFar = { x: landing.x + reach * direction.x, y: landing.y + reach * direction.y };

      const farIndex = indexOf(wall[far]);
      if (farIndex < 0) continue;
      const known = targets.get(farIndex);
      if (known) {
        if (Math.hypot(known.x - landingFar.x, known.y - landingFar.y) > MOVE_EPSILON) return null;
        continue;
      }
      targets.set(farIndex, landingFar);
      const moved = Math.hypot(landingFar.x - corners[farIndex].point.x, landingFar.y - corners[farIndex].point.y);
      // Canto parado só muda o comprimento das paredes dele: não há o que repassar.
      if (moved > MOVE_EPSILON) queue.push(farIndex);
    }
  }
  return { corners, targets };
}
