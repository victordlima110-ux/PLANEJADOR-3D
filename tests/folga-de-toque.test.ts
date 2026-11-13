import { describe, expect, it, afterEach } from 'vitest';
import { definirFolgaDeToque, folgaDeToqueAtual, findWallAt, findDoorAt } from '$lib/utils/hitTesting';
import type { Wall, Door } from '$lib/models/types';

const parede: Wall = {
  id: 'p1', start: { x: 0, y: 0 }, end: { x: 400, y: 0 }, thickness: 15, height: 280,
} as Wall;

const porta: Door = {
  id: 'd1', wallId: 'p1', position: 0.5, width: 80, height: 210, type: 'single',
  swingDirection: 'left', flipSide: false,
} as Door;

afterEach(() => definirFolgaDeToque(1));

describe('folga de toque nos alvos finos da planta', () => {
  it('sem dedo, vale a medida do cursor', () => {
    expect(folgaDeToqueAtual()).toBe(1);
  });

  it('o dedo alcança uma parede que o cursor erraria por pouco', () => {
    // 25 cm acima do eixo da parede: descontada a meia espessura, são 17,5 px
    // de tela até o corpo dela — fora do alcance de 15 px do cursor.
    const ponto = { x: 200, y: 25 };
    expect(findWallAt(ponto, [parede], 1)).toBeNull();
    definirFolgaDeToque(1.8);
    expect(findWallAt(ponto, [parede], 1)?.id).toBe('p1');
  });

  it('a folga acompanha o zoom, como o resto da planta', () => {
    definirFolgaDeToque(1.8);
    // Com zoom 0,5 cada pixel de tela vale 2 cm, então o alcance dobra.
    expect(findWallAt({ x: 200, y: 50 }, [parede], 0.5)?.id).toBe('p1');
    expect(findWallAt({ x: 200, y: 80 }, [parede], 0.5)).toBeNull();
  });

  it('o dedo também alcança a porta', () => {
    const ponto = { x: 200 + 48, y: 0 };
    expect(findDoorAt(ponto, [porta], [parede], 1)).toBeNull();
    definirFolgaDeToque(1.8);
    expect(findDoorAt(ponto, [porta], [parede], 1)?.id).toBe('d1');
  });

  it('um fator inválido ou menor que 1 volta à medida do cursor', () => {
    definirFolgaDeToque(1.8);
    definirFolgaDeToque(0.2);
    expect(folgaDeToqueAtual()).toBe(1);
    definirFolgaDeToque(Number.NaN);
    expect(folgaDeToqueAtual()).toBe(1);
  });
});
