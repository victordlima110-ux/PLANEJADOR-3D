import { roomTemplates, type RoomTemplate } from './roomTemplates';

/**
 * Medidas usuais da construção residencial brasileira, em centímetros.
 *
 * Não são norma nem obrigação — são os valores que aparecem na imensa maioria
 * das casas, oferecidos como atalho para quem não quer digitar número nenhum.
 * Quem precisa de outra medida continua digitando à vontade.
 */
export const MEDIDAS_PADRAO = {
  portaLargura: [60, 70, 80, 90, 120] as const,
  portaAltura: [210, 230] as const,
  janelaLargura: [60, 100, 120, 150, 200] as const,
  janelaAltura: [60, 100, 120] as const,
  janelaPeitoril: [90, 110, 150] as const,
  paredeEspessura: [10, 15, 20, 25] as const,
  peDireito: [250, 270, 280, 300] as const,
  corredorLargura: 90,
} as const;

/** Tipo de ambiente que o tamanho sugere, com o modelo de mobília correspondente. */
export interface SugestaoDeAmbiente {
  /** Chave de tradução do nome sugerido. */
  chave: string;
  /** Nome do modelo em roomTemplates, ou null quando não há mobília a sugerir. */
  template: string | null;
}

/** Proporção a partir da qual o ambiente é corredor, não cômodo. */
const PROPORCAO_CORREDOR = 2.6;

/**
 * O que um ambiente deste tamanho provavelmente é.
 *
 * A decisão vem das medidas porque é o único dado disponível assim que as
 * paredes fecham: a pessoa ainda não deu nome ao cômodo. A sugestão é um
 * palpite para adiantar o trabalho, nunca uma classificação — daí ela sempre
 * aparecer como pergunta, com o nome visível antes de qualquer móvel entrar.
 */
export function sugerirAmbiente(larguraCm: number, profundidadeCm: number): SugestaoDeAmbiente | null {
  const maior = Math.max(larguraCm, profundidadeCm);
  const menor = Math.min(larguraCm, profundidadeCm);
  if (!Number.isFinite(maior) || !Number.isFinite(menor) || menor <= 0) return null;

  const area = (larguraCm * profundidadeCm) / 10000; // m²
  // Faixa estreita e comprida é circulação: mobiliar atrapalharia.
  if (maior / menor >= PROPORCAO_CORREDOR && menor <= 180) return { chave: 'sugestao.corredor', template: null };
  if (area < 2) return { chave: 'sugestao.lavabo', template: null };
  if (area < 5) return { chave: 'sugestao.banheiro', template: 'Bathroom' };
  if (area < 9) return { chave: 'sugestao.quartoSolteiro', template: 'Bedroom' };
  if (area < 13) return { chave: 'sugestao.quartoCasal', template: 'Bedroom' };
  if (area < 18) return { chave: 'sugestao.cozinha', template: 'Kitchen' };
  return { chave: 'sugestao.sala', template: 'Living Room' };
}

export function modeloDeAmbiente(nome: string | null): RoomTemplate | null {
  if (!nome) return null;
  return roomTemplates.find(modelo => modelo.name === nome) ?? null;
}
