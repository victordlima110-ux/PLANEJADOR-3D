import type { Point, Wall } from '$lib/models/types';

/**
 * Guias de alinhamento das paredes.
 *
 * Quem desenha uma planta quase nunca quer uma parede "quase" no mesmo prumo
 * que a outra: quer no mesmo prumo. Acertar isso no olho, ainda mais com o
 * dedo numa tela pequena, é impossível. Então enquanto a parede é puxada o
 * programa procura as pontas das paredes que já existem e, quando a ponta
 * nova chega perto da mesma linha vertical ou horizontal de alguma delas,
 * puxa para o alinhamento exato e mostra um tracejado vermelho ligando as
 * duas — a mesma ajuda que os programas de desenho dão.
 *
 * Aqui ficam só as contas, sem tela e sem estado, para poderem ser testadas.
 */

/** Uma linha de ajuda: o eixo compartilhado e as duas pontas que ela liga. */
export interface GuiaDeAlinhamento {
  /** 'x' são pontas no mesmo prumo vertical; 'y', na mesma altura horizontal. */
  eixo: 'x' | 'y';
  /** A coordenada que as duas pontas têm em comum. */
  valor: number;
  /** A ponta da parede que já existia e serviu de referência. */
  referencia: Point;
  /** A ponta que está sendo desenhada agora. */
  ponta: Point;
}

/** Qual coordenada a parede ainda pode mexer sem perder o ângulo que já tem. */
export type EixosLivres = 'ambos' | 'x' | 'y';

/** Diferença abaixo da qual duas coordenadas são consideradas a mesma linha. */
const IGUAL = 0.01;

/**
 * As pontas de parede que servem de referência.
 *
 * São todas as paredes do pavimento, não só a que a pessoa está continuando:
 * alinhar a lateral direita de um cômodo com a lateral esquerda é justamente o
 * caso em que a ajuda vale mais.
 */
export function referenciasDeAlinhamento(paredes: Wall[], ignorar?: Set<string>): Point[] {
  const pontos: Point[] = [];
  for (const parede of paredes) {
    if (ignorar?.has(parede.id)) continue;
    pontos.push(parede.start, parede.end);
  }
  return pontos;
}

/**
 * Qual direção a parede pode corrigir sem deixar de ser reta.
 *
 * Numa parede horizontal só o x da ponta pode andar — mexer no y a entortaria.
 * Numa vertical, só o y. Numa parede em diagonal, as duas coisas podem andar.
 */
export function eixosLivresDoTracado(comeco: Point | null, ponta: Point): EixosLivres {
  if (!comeco) return 'ambos';
  const dx = Math.abs(ponta.x - comeco.x);
  const dy = Math.abs(ponta.y - comeco.y);
  if (dx < IGUAL && dy < IGUAL) return 'ambos';
  if (dy < IGUAL) return 'x';
  if (dx < IGUAL) return 'y';
  return 'ambos';
}

/**
 * Puxa a ponta para o alinhamento mais próximo, dentro da tolerância.
 *
 * A referência mais próxima ganha, em cada eixo separadamente: dá para a ponta
 * cair ao mesmo tempo no prumo de uma parede e na altura de outra, que é o que
 * fecha um canto certo sem nenhuma das duas ter sido tocada.
 */
export function alinharPonto(
  bruto: Point,
  referencias: Point[],
  tolerancia: number,
  eixosLivres: EixosLivres = 'ambos',
): Point {
  if (!(tolerancia > 0) || referencias.length === 0) return bruto;
  let x = bruto.x;
  let y = bruto.y;
  if (eixosLivres === 'ambos' || eixosLivres === 'x') {
    let melhor = tolerancia;
    for (const r of referencias) {
      const d = Math.abs(r.x - bruto.x);
      if (d < melhor) { melhor = d; x = r.x; }
    }
  }
  if (eixosLivres === 'ambos' || eixosLivres === 'y') {
    let melhor = tolerancia;
    for (const r of referencias) {
      const d = Math.abs(r.y - bruto.y);
      if (d < melhor) { melhor = d; y = r.y; }
    }
  }
  return { x, y };
}

/**
 * Tira da lista as referências que caem sobre um ponto.
 *
 * Serve para o começo do traçado: ele é ponta de parede como as outras, mas
 * alinhar a ponta nova com ele significaria encolher a parede até sumir, e a
 * guia desenhada ficaria em cima da própria parede.
 */
export function semOPonto(referencias: Point[], ponto: Point | null): Point[] {
  if (!ponto) return referencias;
  return referencias.filter((r) => Math.hypot(r.x - ponto.x, r.y - ponto.y) > IGUAL);
}

/**
 * As guias a desenhar para a ponta onde ela está agora.
 *
 * Calculadas depois do encaixe, e não durante, para que o tracejado mostre o
 * alinhamento que de fato existe — inclusive quando a pessoa acertou sozinha,
 * sem o ímã ter puxado nada.
 *
 * De cada eixo sai no máximo uma guia, a da referência mais distante: é ela
 * que desenha a linha mais longa, e uma linha que atravessa a planta inteira
 * diz mais do que um risco curto entre duas pontas vizinhas.
 */
export function guiasVisiveis(ponta: Point, referencias: Point[]): GuiaDeAlinhamento[] {
  const guias: GuiaDeAlinhamento[] = [];
  for (const eixo of ['x', 'y'] as const) {
    let escolhida: Point | null = null;
    let maiorDistancia = -1;
    for (const r of referencias) {
      if (Math.abs(r[eixo] - ponta[eixo]) > IGUAL) continue;
      // A própria ponta não é guia de si mesma.
      const distancia = Math.hypot(r.x - ponta.x, r.y - ponta.y);
      if (distancia <= IGUAL) continue;
      if (distancia > maiorDistancia) { maiorDistancia = distancia; escolhida = r; }
    }
    if (escolhida) guias.push({ eixo, valor: ponta[eixo], referencia: escolhida, ponta });
  }
  return guias;
}
