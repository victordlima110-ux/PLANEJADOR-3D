import { describe, expect, it } from 'vitest';
import { areaDoLote, criarLote, loteValido, paredesForaDoLote, retanguloConstruivel, retanguloDoLote } from '$lib/utils/lote';
import type { Lote, Wall } from '$lib/models/types';

const parede = (id: string, x1: number, y1: number, x2: number, y2: number): Wall =>
  ({ id, start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 15, height: 250, color: '#eee' });

describe('lote', () => {
  it('recusa medidas que não são terreno', () => {
    expect(loteValido(undefined)).toBe(false);
    expect(loteValido({ largura: 0, profundidade: 2500, origem: { x: 0, y: 0 }, frente: 'baixo' })).toBe(false);
    expect(loteValido({ largura: 1000, profundidade: NaN, origem: { x: 0, y: 0 }, frente: 'baixo' })).toBe(false);
    expect(loteValido(criarLote(1000, 2500))).toBe(true);
  });

  it('nasce centrado na origem do desenho', () => {
    const lote = criarLote(1000, 2500);
    expect(retanguloDoLote(lote)).toEqual({ esquerda: -500, direita: 500, topo: -1250, base: 1250 });
    expect(areaDoLote(lote)).toBeCloseTo(250);
  });

  it('a largura é sempre a frente: com a rua na lateral, o lote deita', () => {
    const emPe = retanguloDoLote(criarLote(1000, 2500, 'baixo'));
    expect(emPe.direita - emPe.esquerda).toBe(1000);
    expect(emPe.base - emPe.topo).toBe(2500);

    const deitado = retanguloDoLote(criarLote(1000, 2500, 'direita'));
    expect(deitado.direita - deitado.esquerda).toBe(2500);
    expect(deitado.base - deitado.topo).toBe(1000);
    expect(areaDoLote(criarLote(1000, 2500, 'direita'))).toBeCloseTo(250);
  });

  it('os recuos acompanham o lado da rua', () => {
    const base = criarLote(1000, 2000, 'baixo');
    const comRecuo: Lote = { ...base, recuos: { frente: 300, fundo: 150, esquerda: 100, direita: 50 } };
    // Rua embaixo: o recuo de frente come por baixo.
    expect(retanguloConstruivel(comRecuo)).toEqual({ esquerda: -400, direita: 450, topo: -850, base: 700 });

    // Com a rua em cima tudo gira: a frente passa a comer por cima, e a esquerda
    // de quem olha da rua é a direita da planta.
    const ruaEmCima: Lote = { ...criarLote(1000, 2000, 'cima'), recuos: { frente: 300, fundo: 150, esquerda: 100, direita: 50 } };
    expect(retanguloConstruivel(ruaEmCima)).toEqual({ esquerda: -450, direita: 400, topo: -700, base: 850 });
  });

  it('recuo maior que o lote volta para a divisa, em vez de zerar a área', () => {
    const lote: Lote = { ...criarLote(1000, 2000), recuos: { frente: 1500, fundo: 1500 } };
    expect(retanguloConstruivel(lote)).toEqual(retanguloDoLote(lote));
  });

  it('aponta só as paredes com ponta fora da área construível', () => {
    const lote = criarLote(1000, 1000);
    const paredes = [
      parede('dentro', -400, -400, 400, -400),
      parede('na-linha', -500, 500, 500, 500),
      parede('saindo', 400, 0, 700, 0),
      parede('toda-fora', 900, 900, 1200, 900),
    ];
    expect([...paredesForaDoLote(paredes, lote)]).toEqual(['saindo', 'toda-fora']);
  });

  it('sem lote definido, nenhuma parede é apontada', () => {
    expect(paredesForaDoLote([parede('a', 0, 0, 9999, 9999)], undefined).size).toBe(0);
  });

  it('com recuo, a parede dentro da divisa mas fora do recuo é apontada', () => {
    const lote: Lote = { ...criarLote(1000, 1000), recuos: { esquerda: 200 } };
    const encostada = parede('encostada', -450, 0, -450, 300);
    expect(paredesForaDoLote([encostada], lote).has('encostada')).toBe(true);
    expect(paredesForaDoLote([encostada], { ...lote, recuos: undefined }).has('encostada')).toBe(false);
  });
});
