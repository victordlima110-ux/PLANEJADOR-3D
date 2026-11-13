import { writable } from 'svelte/store';

/** As três abas do painel de ferramentas. */
export type AbaDoPainel = 'draw' | 'rooms' | 'objects';

/**
 * Qual aba do painel de ferramentas está aberta.
 *
 * Fica numa store, e não dentro do painel, porque no celular quem abre o
 * painel é a barra de baixo: tocar em "Móveis" precisa abrir direto em
 * OBJETOS, e não deixar a pessoa procurar a aba certa depois.
 */
export const abaDoPainel = writable<AbaDoPainel>('draw');
