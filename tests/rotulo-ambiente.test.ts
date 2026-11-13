import { describe, expect, it, vi } from 'vitest';
import { drawRooms } from '$lib/utils/canvasRenderer';

// A textura do piso carrega imagem, que não existe fora do navegador — e não é
// o que este teste observa.
vi.mock('$lib/utils/textureGenerator', async (original) => ({
  ...(await original<Record<string, unknown>>()),
  getFloorTextureCanvas: () => null,
}));
import { defaultSettings } from '$lib/stores/settings';
import type { Floor, Room } from '$lib/models/types';

/** Contexto de canvas falso que anota o texto escrito e mede por largura fixa de caractere. */
function contextoFalso(larguraPorLetra = 6) {
  const escritos: { texto: string; x: number; y: number }[] = [];
  const ctx = {
    save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), closePath: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), arc: vi.fn(), rect: vi.fn(), clip: vi.fn(),
    fill: vi.fn(), stroke: vi.fn(), setLineDash: vi.fn(), createPattern: vi.fn(() => null),
    fillRect: vi.fn(), strokeRect: vi.fn(), translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(),
    measureText: (t: string) => ({ width: t.length * larguraPorLetra }),
    fillText: (texto: string, x: number, y: number) => { escritos.push({ texto, x, y }); },
    canvas: { width: 800, height: 600 },
  } as unknown as CanvasRenderingContext2D;
  return { ctx, escritos };
}

const sala = (largura: number, profundidade: number): { floor: Floor; rooms: Room[] } => {
  const pts = [{ x: 0, y: 0 }, { x: largura, y: 0 }, { x: largura, y: profundidade }, { x: 0, y: profundidade }];
  const walls = pts.map((start, i) => ({
    id: `w${i}`, start, end: pts[(i + 1) % pts.length], thickness: 15, height: 250, color: '#eee',
  }));
  const floor: Floor = {
    id: 'f1', name: 'Térreo', elevation: 0, walls, doors: [], windows: [], furniture: [],
    stairs: [], columns: [], rooms: [], measurements: [], annotations: [], textAnnotations: [], entourage: [],
  } as unknown as Floor;
  const rooms: Room[] = [{
    id: 'r1', name: 'Ambiente 1', walls: walls.map(w => w.id),
    floorTexture: 'hardwood', area: (largura * profundidade) / 10000,
  } as Room];
  return { floor, rooms };
};

function desenhar(largura: number, profundidade: number, zoom: number) {
  const { ctx, escritos } = contextoFalso();
  const { floor, rooms } = sala(largura, profundidade);
  drawRooms({ ctx, width: 800, height: 600, zoom, camX: largura / 2, camY: profundidade / 2 },
    floor, rooms, null, true, true, { ...defaultSettings, showInternalDimensions: true });
  return escritos.map(e => e.texto);
}

describe('rótulo do ambiente na planta', () => {
  it('mostra o nome e a área quando o ambiente é grande na tela', () => {
    const textos = desenhar(600, 400, 1);
    expect(textos.some(t => t.includes('Ambiente 1') && t.includes('m²'))).toBe(true);
    expect(textos.some(t => t.includes('×'))).toBe(true);
  });

  it('num zoom afastado o texto some, em vez de estourar as paredes', () => {
    const textos = desenhar(600, 400, 0.05);
    expect(textos.join(' ')).not.toContain('Ambiente 1');
    expect(textos.join(' ')).not.toContain('×');
  });

  it('num ambiente estreito fica só o nome, sem a área', () => {
    // 210 px de ambiente na tela: o terço do meio dá 70 px, que comporta
    // "Ambiente 1" (60 px) mas não o nome com a área (~126 px).
    const textos = desenhar(2100, 800, 0.1).filter(t => t.includes('Ambiente'));
    expect(textos).toEqual(['Ambiente 1']);
  });

  it('com as cotas internas ligadas, o nome só ocupa o terço do meio', () => {
    // 390 px na tela: o terço do meio (130 px) comporta o nome com a área.
    expect(desenhar(3900, 1200, 0.1).some(t => t.includes('('))).toBe(true);
    // 210 px na tela: o terço do meio (70 px) já não comporta o nome com a área.
    expect(desenhar(2100, 1200, 0.1).filter(t => t.includes('Ambiente'))).toEqual(['Ambiente 1']);
  });

  it('as medidas internas não aparecem sem altura para elas', () => {
    // 20 px de altura: cabe o nome, não cabem nome e medidas um sobre o outro.
    const textos = desenhar(1800, 20, 1);
    expect(textos.join(' ')).toContain('Ambiente 1');
    expect(textos.join(' ')).not.toContain('×');
  });
});
