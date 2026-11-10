import { derived, writable } from 'svelte/store';
import { pt } from './locales/pt';
import { origem } from './locales/origem';

/** O programa é só em português. */
export type Locale = 'pt';
export type TranslationKey = keyof typeof pt;

const preference = writable<Locale>('pt');

function fill(text: string, variables: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (token, name) =>
    Object.hasOwn(variables, name) ? String(variables[name]) : token);
}

export function translate(_language: Locale, key: TranslationKey, variables: Record<string, string | number> = {}): string {
  return fill(pt[key], variables);
}

/**
 * Texto original (em inglês) de uma mensagem interna. Serve só para reconhecer
 * os erros que os serviços lançam em inglês e mostrá-los traduzidos.
 */
export function sourceMessage(key: TranslationKey, variables: Record<string, string | number> = {}): string {
  return fill(origem[key], variables);
}

export const locale = {
  subscribe: preference.subscribe,
  set(_value: Locale) {
    preference.set('pt');
    if (typeof document !== 'undefined') document.documentElement.lang = 'pt-BR';
  },
};

export function initializeLocale() {
  locale.set('pt');
}

export const t = derived(preference, (language) =>
  (key: TranslationKey, variables?: Record<string, string | number>) => translate(language, key, variables));
