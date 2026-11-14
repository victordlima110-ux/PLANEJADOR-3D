import { describe, expect, it } from 'vitest';
import { distanciasAteAsParedes } from '$lib/utils/distanciasDoPonto';
import type { Wall } from '$lib/models/types';

const p = (id: string, x1: number, y1: number, x2: number, y2: number): Wall => ({
  id, start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 15, height: 280,
} as Wall);

// Um cômodo de 1000 x 600, com o canto superior esquerdo em (0,0).
const comodo = [
  p('topo', 0, 0, 1000, 0),
  p('direita', 1000, 0, 1000, 600),
  p('baixo', 1000, 600, 0, 600),
  p('esquerda', 0, 600, 0, 0),
];

const porDirecao = (ponto: { x: number; y: number }, paredes = comodo) =>
  Object.fromEntries(distanciasAteAsParedes(ponto, paredes).map((d) => [d.direcao, d.distancia]));

describe('distâncias da ponta até as paredes em volta', () => {
  it('dá as quatro folgas de um ponto dentro do cômodo', () => {
    expect(porDirecao({ x: 300, y: 200 })).toEqual({
      esquerda: 300, direita: 700, cima: 200, baixo: 400,
    });
  });

  it('a soma das folgas opostas fecha a medida do cômodo', () => {
    const d = porDirecao({ x: 742, y: 118 });
    expect(d.esquerda + d.direita).toBe(1000);
    expect(d.cima + d.baixo).toBe(600);
  });

  it('entre duas paredes do mesmo lado, vale a mais próxima', () => {
    const comDivisoria = [...comodo, p('div', 400, 0, 400, 600)];
    expect(porDirecao({ x: 700, y: 300 }, comDivisoria).esquerda).toBe(300);
  });

  it('direção sem parede nenhuma não aparece', () => {
    const soTopo = [p('topo', 0, 0, 1000, 0)];
    expect(porDirecao({ x: 300, y: 200 }, soTopo)).toEqual({ cima: 200 });
  });

  it('não conta a parede em que a própria ponta está encostada', () => {
    expect(porDirecao({ x: 0, y: 300 })).not.toHaveProperty('esquerda');
  });

  it('paredes que podem ser ignoradas ficam de fora', () => {
    const d = distanciasAteAsParedes({ x: 300, y: 200 }, comodo, new Set(['esquerda']));
    expect(d.map((x) => x.direcao).sort()).toEqual(['baixo', 'cima', 'direita']);
  });

  it('parede em curva não entra na conta', () => {
    const curva = { ...p('c', 0, 0, 1000, 0), curvePoint: { x: 500, y: 90 } } as Wall;
    expect(distanciasAteAsParedes({ x: 300, y: 200 }, [curva])).toEqual([]);
  });

  it('o alvo devolvido é o ponto onde a cota encosta na parede', () => {
    const esq = distanciasAteAsParedes({ x: 300, y: 200 }, comodo).find((d) => d.direcao === 'esquerda');
    expect(esq?.alvo).toEqual({ x: 0, y: 200 });
    expect(esq?.paredeId).toBe('esquerda');
  });

  it('um ponto fora do cômodo enxerga as paredes de um lado só', () => {
    const d = porDirecao({ x: 1500, y: 300 });
    expect(d.esquerda).toBe(500);
    expect(d).not.toHaveProperty('direita');
  });
});

import { folgasPerpendiculares, podeDeslizar, deslocamentoParaFolga } from '$lib/utils/distanciasDoPonto';

// Uma divisória vertical nascida sobre as paredes de cima e de baixo, a 400 da esquerda.
const divisoria = p('div', 400, 0, 400, 600);

describe('folgas da parede dentro do cômodo', () => {
  it('uma divisória vertical mede a folga da esquerda e da direita', () => {
    const folgas = folgasPerpendiculares(divisoria, [...comodo, divisoria]);
    expect(folgas.map((f) => [f.direcao, f.distancia])).toEqual([['esquerda', 400], ['direita', 600]]);
  });

  it('uma divisória horizontal mede de cima e de baixo', () => {
    const horizontal = p('h', 0, 250, 1000, 250);
    const folgas = folgasPerpendiculares(horizontal, [...comodo, horizontal]);
    expect(folgas.map((f) => [f.direcao, f.distancia])).toEqual([['cima', 250], ['baixo', 350]]);
  });

  it('parede em diagonal não tem folga perpendicular para mostrar', () => {
    expect(folgasPerpendiculares(p('d', 0, 0, 300, 200), comodo)).toEqual([]);
  });

  it('a parede não mede a si mesma', () => {
    const folgas = folgasPerpendiculares(divisoria, [...comodo, divisoria]);
    expect(folgas.every((f) => f.paredeId !== 'div')).toBe(true);
  });
});

describe('deslizar a parede', () => {
  it('uma divisória em T pode deslizar', () => {
    expect(podeDeslizar(divisoria, [...comodo, divisoria])).toBe(true);
  });

  it('uma parede que forma canto com outra não pode', () => {
    expect(podeDeslizar(comodo[0], comodo)).toBe(false);
  });

  it('parede em curva ou diagonal não desliza', () => {
    expect(podeDeslizar(p('d', 0, 0, 300, 200), [])).toBe(false);
    expect(podeDeslizar({ ...divisoria, curvePoint: { x: 400, y: 300 } } as Wall, [])).toBe(false);
  });

  it('aumentar a folga da esquerda empurra para a direita', () => {
    const folga = folgasPerpendiculares(divisoria, [...comodo, divisoria])[0];
    expect(deslocamentoParaFolga(folga, 500)).toEqual({ x: 100, y: 0 });
    expect(deslocamentoParaFolga(folga, 300)).toEqual({ x: -100, y: 0 });
  });

  it('aumentar a folga da direita empurra para a esquerda', () => {
    const folga = folgasPerpendiculares(divisoria, [...comodo, divisoria])[1];
    expect(deslocamentoParaFolga(folga, 700)).toEqual({ x: -100, y: 0 });
  });

  it('as folgas opostas continuam somando a largura do cômodo depois de andar', () => {
    const folgas = folgasPerpendiculares(divisoria, [...comodo, divisoria]);
    const d = deslocamentoParaFolga(folgas[0], 250);
    const movida = { ...divisoria, start: { x: 400 + d.x, y: 0 }, end: { x: 400 + d.x, y: 600 } };
    const depois = folgasPerpendiculares(movida, [...comodo, movida]);
    expect(depois.map((f) => f.distancia)).toEqual([250, 750]);
  });
});
