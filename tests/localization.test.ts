import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { initializeLocale, locale, sourceMessage, t, translate } from '../src/lib/i18n';
import { origem } from '../src/lib/i18n/locales/origem';
import { pt } from '../src/lib/i18n/locales/pt';

afterEach(() => { vi.unstubAllGlobals(); });

describe('textos da interface', () => {
  it('preserva o conteúdo do usuário e substitui números sem traduzir os valores', () => {
    expect(translate('pt', 'floors.elevation', { name: 'Meu {value} piso' })).toBe('Elevação de Meu {value} piso (cm)');
    expect(translate('pt', 'floors.default', { value: 125.5 })).toBe('Usar padrão (125.5 cm)');
  });

  it('mantém as mesmas chaves e os mesmos espaços reservados do texto de origem', () => {
    expect(Object.keys(pt).sort()).toEqual(Object.keys(origem).sort());
    for (const key of Object.keys(origem) as (keyof typeof origem)[]) {
      expect(pt[key].trim()).not.toBe('');
      expect(pt[key].match(/\{\w+\}/g) ?? []).toEqual(origem[key].match(/\{\w+\}/g) ?? []);
    }
  });

  it('entrega o texto em português e marca o idioma do documento', () => {
    vi.stubGlobal('document', { documentElement: { lang: '' } });
    const values: string[] = [];
    const unsubscribe = t.subscribe((translate) => values.push(translate('settings.title')));
    initializeLocale();
    unsubscribe();
    expect(values[0]).toBe('Configurações');
    expect(get(locale)).toBe('pt');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('expõe o texto de origem só para reconhecer erros internos', () => {
    expect(sourceMessage('settings.title')).toBe(origem['settings.title']);
    expect(sourceMessage('settings.title')).not.toBe(translate('pt', 'settings.title'));
  });
});
