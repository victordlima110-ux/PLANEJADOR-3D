import { describe, expect, it } from 'vitest';
import {
  referenciasDeAlinhamento, semOPonto, alinharPonto, guiasVisiveis, eixosLivresDoTracado,
} from '$lib/utils/alinhamento';
import type { Wall } from '$lib/models/types';

const parede = (id: string, x1: number, y1: number, x2: number, y2: number): Wall => ({
  id, start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 15, height: 280,
} as Wall);

// Um cômodo com a lateral esquerda já pronta, de (0,0) até (0,400).
const lateralEsquerda = parede('esq', 0, 0, 0, 400);

describe('referências de alinhamento', () => {
  it('são as duas pontas de cada parede', () => {
    expect(referenciasDeAlinhamento([lateralEsquerda])).toEqual([{ x: 0, y: 0 }, { x: 0, y: 400 }]);
  });

  it('paredes ignoradas ficam de fora', () => {
    expect(referenciasDeAlinhamento([lateralEsquerda], new Set(['esq']))).toEqual([]);
  });

  it('o começo do traçado não serve de guia para si mesmo', () => {
    const refs = referenciasDeAlinhamento([lateralEsquerda]);
    expect(semOPonto(refs, { x: 0, y: 0 })).toEqual([{ x: 0, y: 400 }]);
    expect(semOPonto(refs, null)).toHaveLength(2);
  });
});

describe('eixo livre conforme a direção da parede', () => {
  it('numa parede horizontal só a ponta anda no x', () => {
    expect(eixosLivresDoTracado({ x: 0, y: 0 }, { x: 300, y: 0 })).toBe('x');
  });
  it('numa parede vertical só a ponta anda no y', () => {
    expect(eixosLivresDoTracado({ x: 0, y: 0 }, { x: 0, y: 300 })).toBe('y');
  });
  it('numa diagonal nenhum eixo pode ser mexido sozinho', () => {
    expect(eixosLivresDoTracado({ x: 0, y: 0 }, { x: 300, y: 200 })).toBe('ambos');
  });
  it('sem começo, ou com a ponta ainda no começo, os dois valem', () => {
    expect(eixosLivresDoTracado(null, { x: 5, y: 5 })).toBe('ambos');
    expect(eixosLivresDoTracado({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe('ambos');
  });
});

describe('ímã do alinhamento', () => {
  const refs = referenciasDeAlinhamento([lateralEsquerda]);

  it('puxa a lateral direita para terminar na mesma altura da esquerda', () => {
    // Descendo a lateral direita e parando em 392: a esquerda termina em 400.
    const ponto = alinharPonto({ x: 500, y: 392 }, refs, 15, 'y');
    expect(ponto).toEqual({ x: 500, y: 400 });
  });

  it('não puxa o que está longe demais', () => {
    expect(alinharPonto({ x: 500, y: 370 }, refs, 15, 'y')).toEqual({ x: 500, y: 370 });
  });

  it('respeita o eixo travado para não entortar a parede', () => {
    // A parede é horizontal: mexer no y a entortaria, então o y fica.
    expect(alinharPonto({ x: 6, y: 392 }, refs, 15, 'x')).toEqual({ x: 0, y: 392 });
  });

  it('com os dois eixos livres, fecha um canto que não existia', () => {
    expect(alinharPonto({ x: 7, y: 395 }, refs, 15, 'ambos')).toEqual({ x: 0, y: 400 });
  });

  it('entre duas referências, ganha a mais próxima', () => {
    const duas = referenciasDeAlinhamento([lateralEsquerda, parede('b', 10, 0, 10, 400)]);
    expect(alinharPonto({ x: 8, y: 999 }, duas, 15, 'x').x).toBe(10);
  });

  it('sem referências ou sem tolerância, nada muda', () => {
    expect(alinharPonto({ x: 7, y: 7 }, [], 15)).toEqual({ x: 7, y: 7 });
    expect(alinharPonto({ x: 7, y: 7 }, refs, 0)).toEqual({ x: 7, y: 7 });
  });
});

describe('tracejado mostrado', () => {
  const refs = referenciasDeAlinhamento([lateralEsquerda]);

  it('aparece uma guia horizontal quando a ponta está na altura de outra', () => {
    const guias = guiasVisiveis({ x: 500, y: 400 }, refs);
    expect(guias).toHaveLength(1);
    expect(guias[0]).toMatchObject({ eixo: 'y', valor: 400, referencia: { x: 0, y: 400 } });
  });

  it('saem as duas guias quando a ponta cai no prumo e na altura', () => {
    const emL = referenciasDeAlinhamento([lateralEsquerda, parede('topo', 0, 0, 600, 0)]);
    const guias = guiasVisiveis({ x: 600, y: 400 }, emL);
    expect(guias.map((g) => g.eixo).sort()).toEqual(['x', 'y']);
  });

  it('não desenha nada quando a ponta não está alinhada com ninguém', () => {
    expect(guiasVisiveis({ x: 500, y: 393 }, refs)).toEqual([]);
  });

  it('a ponta não é guia de si mesma', () => {
    expect(guiasVisiveis({ x: 0, y: 400 }, [{ x: 0, y: 400 }])).toEqual([]);
  });

  it('entre guias do mesmo eixo, fica a que desenha a linha mais longa', () => {
    // As três estão na mesma altura, então a linha até a mais distante passa
    // por cima da outra: uma risca só já mostra os dois alinhamentos.
    const muitas = [{ x: 400, y: 400 }, { x: 0, y: 400 }];
    expect(guiasVisiveis({ x: 500, y: 400 }, muitas)[0].referencia).toEqual({ x: 0, y: 400 });
  });
});
