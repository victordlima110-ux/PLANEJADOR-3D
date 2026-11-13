import type { Point, Wall } from '$lib/models/types';

/**
 * Distâncias da ponta da parede até as paredes em volta.
 *
 * Quem desenha precisa saber onde a ponta está dentro do que já existe: a
 * quantos metros da parede da esquerda, da direita, da de cima e da de baixo.
 * Sem isso, posicionar uma divisória no meio de um cômodo vira tentativa e
 * erro — e o número que importa não é o comprimento da parede nova, é a folga
 * que sobra dos dois lados.
 *
 * As contas são feitas sobre o eixo das paredes, que é como elas são guardadas.
 */

export type Direcao = 'esquerda' | 'direita' | 'cima' | 'baixo';

export interface DistanciaAteParede {
  direcao: Direcao;
  /** Em centímetros, sempre positiva. */
  distancia: number;
  /** Onde o raio encontrou a parede, para desenhar a linha de cota. */
  alvo: Point;
  paredeId: string;
}

/** Abaixo disso o raio é considerado em cima da parede, e não cruzando-a. */
const PERTO = 0.5;

/** Onde um raio horizontal na altura y cruza o eixo da parede, se cruzar. */
function cruzamentoHorizontal(parede: Wall, y: number): number | null {
  const { start: a, end: b } = parede;
  if (Math.abs(b.y - a.y) < PERTO) return null; // paralela ao raio
  const t = (y - a.y) / (b.y - a.y);
  if (t < 0 || t > 1) return null;
  return a.x + t * (b.x - a.x);
}

/** Onde um raio vertical no prumo x cruza o eixo da parede, se cruzar. */
function cruzamentoVertical(parede: Wall, x: number): number | null {
  const { start: a, end: b } = parede;
  if (Math.abs(b.x - a.x) < PERTO) return null;
  const t = (x - a.x) / (b.x - a.x);
  if (t < 0 || t > 1) return null;
  return a.y + t * (b.y - a.y);
}

/**
 * A parede mais próxima em cada uma das quatro direções.
 *
 * Direções sem parede nenhuma simplesmente não aparecem na lista — é melhor
 * não escrever cota do que escrever uma cota até o vazio.
 */
export function distanciasAteAsParedes(
  ponto: Point,
  paredes: Wall[],
  ignorar?: Set<string>,
): DistanciaAteParede[] {
  const achados = new Map<Direcao, DistanciaAteParede>();
  const guardar = (direcao: Direcao, distancia: number, alvo: Point, paredeId: string) => {
    if (distancia <= PERTO) return;
    const atual = achados.get(direcao);
    if (!atual || distancia < atual.distancia) achados.set(direcao, { direcao, distancia, alvo, paredeId });
  };

  for (const parede of paredes) {
    if (ignorar?.has(parede.id)) continue;
    // Paredes em curva não têm cruzamento simples; o eixo reto mentiria.
    if (parede.curvePoint) continue;

    const x = cruzamentoHorizontal(parede, ponto.y);
    if (x !== null) {
      if (x < ponto.x) guardar('esquerda', ponto.x - x, { x, y: ponto.y }, parede.id);
      else guardar('direita', x - ponto.x, { x, y: ponto.y }, parede.id);
    }

    const y = cruzamentoVertical(parede, ponto.x);
    if (y !== null) {
      // No desenho da planta, y menor é mais acima.
      if (y < ponto.y) guardar('cima', ponto.y - y, { x: ponto.x, y }, parede.id);
      else guardar('baixo', y - ponto.y, { x: ponto.x, y }, parede.id);
    }
  }

  return [...achados.values()];
}
