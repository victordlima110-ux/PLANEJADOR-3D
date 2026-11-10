import { describe, expect, it } from 'vitest';
import { MEDIDAS_PADRAO, modeloDeAmbiente, sugerirAmbiente } from '$lib/utils/sugestoes';

describe('sugestão de ambiente pelo tamanho', () => {
  it.each([
    [120, 150, 'sugestao.lavabo'],
    [150, 200, 'sugestao.banheiro'],
    [250, 300, 'sugestao.quartoSolteiro'],
    [300, 400, 'sugestao.quartoCasal'],
    [350, 450, 'sugestao.cozinha'],
    [400, 600, 'sugestao.sala'],
  ])('%s × %s cm sugere %s', (largura, profundidade, chave) => {
    expect(sugerirAmbiente(largura as number, profundidade as number)?.chave).toBe(chave);
  });

  it('faixa estreita e comprida é corredor, e não recebe mobília', () => {
    const corredor = sugerirAmbiente(100, 500);
    expect(corredor).toEqual({ chave: 'sugestao.corredor', template: null });
    // A mesma área num formato quadrado já é um cômodo.
    expect(sugerirAmbiente(224, 224)?.chave).not.toBe('sugestao.corredor');
  });

  it('não sugere nada para medidas impossíveis', () => {
    expect(sugerirAmbiente(0, 300)).toBeNull();
    expect(sugerirAmbiente(NaN, 300)).toBeNull();
    expect(sugerirAmbiente(-100, 300)).toBeNull();
  });

  it('a sugestão não depende da ordem das medidas', () => {
    expect(sugerirAmbiente(300, 400)).toEqual(sugerirAmbiente(400, 300));
  });

  it('todo modelo sugerido existe de verdade no catálogo', () => {
    const tamanhos: [number, number][] = [[150, 200], [250, 300], [300, 400], [350, 450], [400, 600]];
    for (const [largura, profundidade] of tamanhos) {
      const sugestao = sugerirAmbiente(largura, profundidade)!;
      expect(modeloDeAmbiente(sugestao.template)).not.toBeNull();
    }
    expect(modeloDeAmbiente(null)).toBeNull();
    expect(modeloDeAmbiente('Cômodo que não existe')).toBeNull();
  });
});

describe('medidas padrão', () => {
  it('traz as medidas usuais da construção brasileira', () => {
    expect(MEDIDAS_PADRAO.portaLargura).toContain(80);
    expect(MEDIDAS_PADRAO.janelaLargura).toContain(120);
    expect(MEDIDAS_PADRAO.paredeEspessura).toContain(15);
    expect(MEDIDAS_PADRAO.corredorLargura).toBe(90);
  });

  it('todas as listas estão em ordem crescente, para a escolha ficar previsível', () => {
    for (const [nome, valores] of Object.entries(MEDIDAS_PADRAO)) {
      if (!Array.isArray(valores)) continue;
      expect([...valores].sort((a, b) => a - b), nome).toEqual([...valores]);
    }
  });
});
