import { describe, expect, it } from 'vitest';
import { recuoDaMedida, wallDimensionLabel } from '$lib/utils/wallDimensionLabel';
import type { Wall } from '$lib/models/types';

const p = (id: string, x1: number, y1: number, x2: number, y2: number, esp = 15): Wall => ({
  id, start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: esp, height: 280,
} as Wall);

// Um retângulo de 1215 x 1215 no eixo, com paredes de 15 cm: o vão livre dá 1200.
const topo = p('topo', 0, 0, 1215, 0);
const direita = p('dir', 1215, 0, 1215, 1215);
const baixo = p('baixo', 1215, 1215, 0, 1215);
const esquerda = p('esq', 0, 1215, 0, 0);
const retangulo = [topo, direita, baixo, esquerda];

describe('medida que a planta escreve', () => {
  it('desconta meia espessura de cada parede que cruza na ponta', () => {
    expect(recuoDaMedida(topo, retangulo, 'edge')).toBe(15);
    expect(wallDimensionLabel(topo, retangulo, 'edge').length).toBe(1200);
  });

  it('no modo eixo a eixo não desconta nada', () => {
    expect(recuoDaMedida(topo, retangulo, 'centerline')).toBe(0);
    expect(wallDimensionLabel(topo, retangulo, 'centerline').length).toBe(1215);
  });

  it('parede solta, sem vizinha nas pontas, não tem recuo', () => {
    const solta = p('solta', 0, 500, 400, 500);
    expect(recuoDaMedida(solta, [solta], 'edge')).toBe(0);
  });

  it('presa só de um lado desconta só esse lado', () => {
    const meia = [topo, esquerda];
    expect(recuoDaMedida(topo, meia, 'edge')).toBe(7.5);
  });

  it('paredes mais grossas descontam mais', () => {
    const grossas = [topo, p('dir', 1215, 0, 1215, 400, 25), p('esq', 0, 400, 0, 0, 25)];
    expect(recuoDaMedida(topo, grossas, 'edge')).toBe(25);
    expect(wallDimensionLabel(topo, grossas, 'edge').length).toBe(1190);
  });

  it('parede em curva fica pelo eixo, que é o que o desenho mostra', () => {
    const curva = { ...topo, curvePoint: { x: 600, y: 80 } } as Wall;
    expect(recuoDaMedida(curva, [curva, esquerda, direita], 'edge')).toBe(0);
  });

  it('a conta de ida e volta fecha: digitar 1200 devolve 1215 de eixo', () => {
    const recuo = recuoDaMedida(topo, retangulo, 'edge');
    expect(1200 + recuo).toBe(1215);
  });
});
