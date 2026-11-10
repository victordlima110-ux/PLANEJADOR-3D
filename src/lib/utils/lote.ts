import type { Lote, Point, Wall } from '$lib/models/types';

/** Retângulo do lote em centímetros, já resolvido a partir da origem e das medidas. */
export interface RetanguloLote { esquerda: number; direita: number; topo: number; base: number }

/** Medidas de lote abaixo disto não são terreno, são erro de digitação. */
export const LOTE_MINIMO = 50; // cm

export function loteValido(lote: Lote | undefined): lote is Lote {
  return !!lote
    && Number.isFinite(lote.largura) && lote.largura >= LOTE_MINIMO
    && Number.isFinite(lote.profundidade) && lote.profundidade >= LOTE_MINIMO
    && Number.isFinite(lote.origem?.x) && Number.isFinite(lote.origem?.y);
}

/**
 * A divisa do lote.
 *
 * A largura é sempre a medida da frente, então quando a rua fica à esquerda ou
 * à direita largura e profundidade trocam de eixo no desenho.
 */
export function retanguloDoLote(lote: Lote): RetanguloLote {
  const deitado = lote.frente === 'esquerda' || lote.frente === 'direita';
  const largura = deitado ? lote.profundidade : lote.largura;
  const altura = deitado ? lote.largura : lote.profundidade;
  return {
    esquerda: lote.origem.x,
    direita: lote.origem.x + largura,
    topo: lote.origem.y,
    base: lote.origem.y + altura,
  };
}

/** A área construível, já descontados os recuos informados. */
export function retanguloConstruivel(lote: Lote): RetanguloLote {
  const divisa = retanguloDoLote(lote);
  const recuos = lote.recuos;
  if (!recuos) return divisa;
  const recuo = (valor: number | undefined) => (Number.isFinite(valor) && valor! > 0 ? valor! : 0);
  // Os recuos são informados do ponto de vista de quem olha da rua, então giram
  // junto com o lado da frente: com a rua embaixo, a esquerda de quem olha é a
  // esquerda da planta; com a rua em cima, é a direita.
  const porLado: Record<Lote['frente'], [number, number, number, number]> = {
    // [esquerda da planta, direita da planta, topo, base]
    cima: [recuo(recuos.direita), recuo(recuos.esquerda), recuo(recuos.frente), recuo(recuos.fundo)],
    baixo: [recuo(recuos.esquerda), recuo(recuos.direita), recuo(recuos.fundo), recuo(recuos.frente)],
    esquerda: [recuo(recuos.frente), recuo(recuos.fundo), recuo(recuos.esquerda), recuo(recuos.direita)],
    direita: [recuo(recuos.fundo), recuo(recuos.frente), recuo(recuos.direita), recuo(recuos.esquerda)],
  };
  const [e, d, t, b] = porLado[lote.frente];
  const construivel = {
    esquerda: divisa.esquerda + e, direita: divisa.direita - d,
    topo: divisa.topo + t, base: divisa.base - b,
  };
  // Recuo maior que o próprio lote não deixa nada de pé: volta para a divisa.
  if (construivel.direita - construivel.esquerda < LOTE_MINIMO
    || construivel.base - construivel.topo < LOTE_MINIMO) return divisa;
  return construivel;
}

const FOLGA = 0.5; // cm: tolerância para a parede que encosta exatamente na linha

function foraDoRetangulo(ponto: Point, area: RetanguloLote): boolean {
  return ponto.x < area.esquerda - FOLGA || ponto.x > area.direita + FOLGA
    || ponto.y < area.topo - FOLGA || ponto.y > area.base + FOLGA;
}

/** Paredes com alguma ponta fora da área construível. */
export function paredesForaDoLote(walls: Wall[], lote: Lote | undefined): Set<string> {
  const fora = new Set<string>();
  if (!loteValido(lote)) return fora;
  const area = retanguloConstruivel(lote);
  for (const parede of walls) {
    if (foraDoRetangulo(parede.start, area) || foraDoRetangulo(parede.end, area)) fora.add(parede.id);
  }
  return fora;
}

/** Área do terreno em metros quadrados. */
export function areaDoLote(lote: Lote): number {
  return (lote.largura * lote.profundidade) / 10000;
}

/**
 * Um lote novo, centrado na origem do desenho.
 *
 * Centrar em (0,0) deixa o terreno em volta de onde a planta começa, em vez de
 * obrigar a pessoa a procurar o lote depois de criá-lo.
 */
export function criarLote(larguraCm: number, profundidadeCm: number, frente: Lote['frente'] = 'baixo'): Lote {
  const deitado = frente === 'esquerda' || frente === 'direita';
  const largura = deitado ? profundidadeCm : larguraCm;
  const altura = deitado ? larguraCm : profundidadeCm;
  return {
    largura: larguraCm,
    profundidade: profundidadeCm,
    frente,
    origem: { x: -largura / 2, y: -altura / 2 },
  };
}
