import { describe, expect, it } from 'vitest';
import { planWallResize, wallLength } from '$lib/utils/wallEditing';
import type { Wall } from '$lib/models/types';

/** Monta um polígono fechado a partir dos vértices, no sentido dado. */
function poligono(pontos: { x: number; y: number }[], prefixo = 'p'): Wall[] {
  return pontos.map((start, i) => ({
    id: `${prefixo}-${i}`, start, end: pontos[(i + 1) % pontos.length],
    thickness: 15, height: 250, color: '#eeeeee',
  }));
}

/** Aplica o plano e devolve as paredes já com as mudanças. */
function aplicar(paredes: Wall[], plano: Map<string, Partial<Wall>>): Wall[] {
  return paredes.map(parede => ({ ...parede, ...(plano.get(parede.id) ?? {}) }));
}

const ehVertical = (w: Wall) => Math.abs(w.end.x - w.start.x) < 1e-6;
const ehHorizontal = (w: Wall) => Math.abs(w.end.y - w.start.y) < 1e-6;

describe('redimensionar parede mantendo as vizinhas no eixo', () => {
  const retangulo = () => poligono([{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }]);

  it('esticar um lado do retângulo dá outro retângulo, não um trapézio', () => {
    const antes = retangulo();
    const depois = aplicar(antes, planWallResize(antes, 'p-0', 500));
    expect(depois[0].start).toEqual({ x: 0, y: 0 });
    expect(depois[0].end.x).toBeCloseTo(500);
    expect(depois[1].start).toEqual(depois[0].end);
    expect(depois[1].end.x).toBeCloseTo(500);
    expect(depois[1].end.y).toBe(300);
    expect(depois[2].end).toEqual({ x: 0, y: 300 });
    for (const parede of depois) expect(ehVertical(parede) || ehHorizontal(parede)).toBe(true);
    expect(wallLength(depois[1])).toBeCloseTo(300);
    expect(wallLength(depois[2])).toBeCloseTo(500);
  });

  it('encurtar também mantém o retângulo', () => {
    const antes = retangulo();
    const depois = aplicar(antes, planWallResize(antes, 'p-0', 250));
    expect(depois[1].start.x).toBeCloseTo(250);
    expect(depois[1].end.x).toBeCloseTo(250);
    expect(wallLength(depois[2])).toBeCloseTo(250);
    for (const parede of depois) expect(ehVertical(parede) || ehHorizontal(parede)).toBe(true);
  });

  it('vale para a parede vertical e para a ponta presa invertida', () => {
    const antes = retangulo();
    const depois = aplicar(antes, planWallResize(antes, 'p-1', 400));
    expect(depois[1].start).toEqual({ x: 400, y: 0 });
    expect(depois[1].end.y).toBeCloseTo(400);
    expect(depois[2].start.y).toBeCloseTo(400);
    expect(depois[2].end.y).toBeCloseTo(400);
    for (const parede of depois) expect(ehVertical(parede) || ehHorizontal(parede)).toBe(true);

    const presoNoFim = aplicar(antes, planWallResize(antes, 'p-0', 500, 'end'));
    expect(presoNoFim[0].end).toEqual({ x: 400, y: 0 });
    expect(presoNoFim[0].start.x).toBeCloseTo(-100);
    expect(presoNoFim[3].start.x).toBeCloseTo(-100);
    expect(presoNoFim[3].end.x).toBeCloseTo(-100);
  });

  it('funciona em planta em L, propagando só até onde precisa', () => {
    const antes = poligono([
      { x: 0, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 200 },
      { x: 300, y: 200 }, { x: 300, y: 500 }, { x: 0, y: 500 },
    ], 'L');
    const depois = aplicar(antes, planWallResize(antes, 'L-0', 700));
    for (const parede of depois) expect(ehVertical(parede) || ehHorizontal(parede)).toBe(true);
    expect(depois[1].start.x).toBeCloseTo(700);
    expect(depois[1].end.x).toBeCloseTo(700);
    // O braço de baixo do L não é tocado.
    expect(depois[3].end).toEqual({ x: 300, y: 500 });
    expect(depois[4].end).toEqual({ x: 0, y: 500 });
  });

  it('parede solta continua só mudando de comprimento', () => {
    const sozinha: Wall[] = [{ id: 'so', start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, thickness: 15, height: 250, color: '#eee' }];
    const depois = aplicar(sozinha, planWallResize(sozinha, 'so', 250));
    expect(depois[0].end).toEqual({ x: 250, y: 0 });
  });

  it('na diagonal volta a mexer só na ponta, sem espalhar pela planta', () => {
    const triangulo = poligono([{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 200, y: 300 }], 't');
    const depois = aplicar(triangulo, planWallResize(triangulo, 't-0', 500));
    expect(depois[0].end.x).toBeCloseTo(500);
    expect(depois[1].start.x).toBeCloseTo(500);
    // O vértice de cima fica onde estava: a diagonal apenas muda de inclinação.
    expect(depois[1].end).toEqual({ x: 200, y: 300 });
    expect(depois[2].start).toEqual({ x: 200, y: 300 });
  });

  it('parede curva vizinha não é arrastada pela propagação', () => {
    const paredes: Wall[] = [
      ...poligono([{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 }], 'c'),
    ];
    paredes[1] = { ...paredes[1], curvePoint: { x: 460, y: 150 } };
    const depois = aplicar(paredes, planWallResize(paredes, 'c-0', 500));
    expect(depois[0].end.x).toBeCloseTo(500);
    expect(depois[1].start.x).toBeCloseTo(500);
    // Sem propagar pela curva, o canto de cima fica onde estava.
    expect(depois[1].end).toEqual({ x: 400, y: 300 });
  });

  it('desligando a opção, volta exatamente ao comportamento antigo', () => {
    const antes = retangulo();
    const depois = aplicar(antes, planWallResize(antes, 'p-0', 500, 'start', false));
    expect(depois[0].end.x).toBeCloseTo(500);
    expect(depois[1].start.x).toBeCloseTo(500);
    expect(depois[1].end).toEqual({ x: 400, y: 300 });
    expect(ehVertical(depois[1])).toBe(false);
  });

  it('não deixa a propagação colapsar uma parede vizinha', () => {
    const antes = retangulo();
    expect(() => planWallResize(antes, 'p-1', 0.5)).toThrow('at least 1 cm');
  });
});
