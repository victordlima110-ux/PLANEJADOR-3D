import { describe, expect, it, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { currentProject, activeFloor, addArea, updateArea, removeElement, createDefaultProject } from '$lib/stores/project';

describe('área demarcada', () => {
  beforeEach(() => { currentProject.set(createDefaultProject()); });

  it('nasce com o nome dado e os dois cantos', () => {
    const id = addArea({ x: 0, y: 0 }, { x: 300, y: 200 }, 'Cozinha');
    const area = get(activeFloor)?.areas?.find(a => a.id === id);
    expect(area).toMatchObject({ name: 'Cozinha', start: { x: 0, y: 0 }, end: { x: 300, y: 200 } });
  });

  it('o pavimento começa sem áreas e só ganha a lista quando precisa', () => {
    expect(get(activeFloor)?.areas).toBeUndefined();
    addArea({ x: 0, y: 0 }, { x: 100, y: 100 }, 'Área 1');
    expect(get(activeFloor)?.areas).toHaveLength(1);
  });

  it('pode ser rebatizada', () => {
    const id = addArea({ x: 0, y: 0 }, { x: 300, y: 200 }, 'Área 1');
    updateArea(id, { name: 'Lavanderia' });
    expect(get(activeFloor)?.areas?.[0].name).toBe('Lavanderia');
  });

  it('pode ser redimensionada pelos cantos', () => {
    const id = addArea({ x: 0, y: 0 }, { x: 300, y: 200 }, 'Área 1');
    updateArea(id, { end: { x: 500, y: 200 } });
    expect(get(activeFloor)?.areas?.[0].end).toEqual({ x: 500, y: 200 });
  });

  it('é apagada como qualquer outro elemento', () => {
    const id = addArea({ x: 0, y: 0 }, { x: 300, y: 200 }, 'Área 1');
    removeElement(id);
    expect(get(activeFloor)?.areas).toHaveLength(0);
  });

  it('não mexe nas paredes nem nos ambientes', () => {
    const antes = get(activeFloor)?.walls.length ?? 0;
    addArea({ x: 0, y: 0 }, { x: 300, y: 200 }, 'Cozinha');
    expect(get(activeFloor)?.walls.length).toBe(antes);
    expect(get(activeFloor)?.rooms.length ?? 0).toBe(0);
  });

  it('vai junto no projeto salvo', () => {
    addArea({ x: 10, y: 20 }, { x: 310, y: 220 }, 'Cozinha');
    const salvo = JSON.parse(JSON.stringify(get(currentProject)));
    expect(salvo.floors[0].areas).toEqual([
      { id: expect.any(String), name: 'Cozinha', start: { x: 10, y: 20 }, end: { x: 310, y: 220 } },
    ]);
  });
});
