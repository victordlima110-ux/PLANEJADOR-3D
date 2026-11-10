import { readable } from 'svelte/store';

/** Abaixo disso o editor usa o formato de celular (mesmo ponto do `md` do Tailwind). */
export const LARGURA_CELULAR = 768;

/**
 * Verdadeiro enquanto a janela tem largura de celular. No servidor vale `false`,
 * de modo que a página renderizada já nasça no formato de computador e o
 * navegador corrija no primeiro quadro.
 */
export const telaPequena = readable(false, (set) => {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  const consulta = window.matchMedia(`(max-width: ${LARGURA_CELULAR - 0.02}px)`);
  const aplicar = () => set(consulta.matches);
  aplicar();
  consulta.addEventListener('change', aplicar);
  return () => consulta.removeEventListener('change', aplicar);
});
