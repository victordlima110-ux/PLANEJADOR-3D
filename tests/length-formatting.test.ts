import { expect, it } from 'vitest';
import { formatArea, formatLength, formatLengthPrecise } from '$lib/stores/settings';

it.each([[0, '0 cm'], [12, '12 cm'], [99, '99 cm'], [100, '1 m'], [125, '1.25 m'], [250, '2.5 m']] as const)(
  'mostra %s cm como %s', (cm, label) => {
    expect(formatLength(cm, 'metric')).toBe(label);
  });

it.each([[12, '12.0 cm'], [99.44, '99.4 cm'], [125, '1.25 m'], [250, '2.50 m']] as const)(
  'mostra %s cm com precisão como %s', (cm, label) => {
    expect(formatLengthPrecise(cm, 'metric')).toBe(label);
  });

it('mostra a área em metros quadrados', () => {
  expect(formatArea(12.34, 'metric')).toBe('12.3 m²');
});
