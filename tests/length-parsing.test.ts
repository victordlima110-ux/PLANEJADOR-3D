import { expect, it } from 'vitest';
import { parseLengthInput } from '$lib/stores/settings';

it.each([
  [' 2,5 m ', 250], [' 2.5 m ', 250],
  ['250 mm', 25], ['12 cm', 12], ['.5m', 50],
  ['-150 cm', -150], ['1e2', 100],
])('lê %s com a unidade escrita', (text, cm) => {
  expect(parseLengthInput(String(text), 'metric')).toBeCloseTo(Number(cm));
});

it('lê um número sem unidade como centímetros', () => {
  expect(parseLengthInput('12', 'metric')).toBe(12);
  expect(parseLengthInput('12,5', 'metric')).toBe(12.5);
});

it.each(['', '12lixo', '2 m sobra', '1.2.3', 'Infinity', '1e999', '12"', "5'6\""])(
  'recusa %s', (text) => {
    expect(parseLengthInput(text, 'metric')).toBeNull();
  });
