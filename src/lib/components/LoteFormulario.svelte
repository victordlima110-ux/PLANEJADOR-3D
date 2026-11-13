<script lang="ts">
  import { t } from '$lib/i18n';
  import type { Lote } from '$lib/models/types';
  import { areaDoLote, criarLote, LOTE_MINIMO } from '$lib/utils/lote';

  let { inicial = null, aoConfirmar, aoPular, rotuloPular }: {
    inicial?: Lote | null;
    aoConfirmar: (lote: Lote) => void;
    aoPular: () => void;
    rotuloPular?: string;
  } = $props();

  /**
   * Valores iniciais dos campos, lidos uma única vez.
   *
   * O formulário passa a ser da pessoa a partir daqui: se o lote mudar por
   * fora enquanto ela digita, o que está escrito não pode ser sobrescrito.
   * As medidas são digitadas em metros, que é como se fala de terreno, e
   * guardadas em centímetros, que é a unidade do resto do programa.
   */
  function valoresIniciais(lote: Lote | null) {
    const emMetros = (cm: number | undefined) => (cm ? String(cm / 100) : '');
    return {
      largura: lote ? String(lote.largura / 100) : '10',
      profundidade: lote ? String(lote.profundidade / 100) : '25',
      frente: lote?.frente ?? ('baixo' as Lote['frente']),
      temRecuos: !!lote?.recuos,
      recuoFrente: emMetros(lote?.recuos?.frente),
      recuoFundo: emMetros(lote?.recuos?.fundo),
      recuoEsquerda: emMetros(lote?.recuos?.esquerda),
      recuoDireita: emMetros(lote?.recuos?.direita),
    };
  }
  // svelte-ignore state_referenced_locally -- leitura única proposital: ver acima.
  const inicio = valoresIniciais(inicial);

  let largura = $state(inicio.largura);
  let profundidade = $state(inicio.profundidade);
  let frente = $state<Lote['frente']>(inicio.frente);
  let mostrarRecuos = $state(inicio.temRecuos);
  let recuoFrente = $state(inicio.recuoFrente);
  let recuoFundo = $state(inicio.recuoFundo);
  let recuoEsquerda = $state(inicio.recuoEsquerda);
  let recuoDireita = $state(inicio.recuoDireita);

  /** Lê metros aceitando vírgula, como se escreve aqui. */
  function metros(texto: string): number | null {
    const valor = Number(texto.trim().replace(',', '.'));
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }
  const emCm = (texto: string): number | undefined => {
    const valor = metros(texto);
    return valor === null ? undefined : Math.round(valor * 100);
  };

  let larguraCm = $derived(emCm(largura));
  let profundidadeCm = $derived(emCm(profundidade));
  let valido = $derived(
    larguraCm !== undefined && larguraCm >= LOTE_MINIMO
    && profundidadeCm !== undefined && profundidadeCm >= LOTE_MINIMO);
  let area = $derived(valido ? areaDoLote(criarLote(larguraCm!, profundidadeCm!)) : null);

  const lados: { valor: Lote['frente']; chave: string }[] = [
    { valor: 'baixo', chave: 'lote.frenteBaixo' },
    { valor: 'cima', chave: 'lote.frenteCima' },
    { valor: 'esquerda', chave: 'lote.frenteEsquerda' },
    { valor: 'direita', chave: 'lote.frenteDireita' },
  ];

  function confirmar() {
    if (!valido) return;
    const lote = criarLote(larguraCm!, profundidadeCm!, frente);
    if (mostrarRecuos) {
      const recuos = {
        frente: emCm(recuoFrente), fundo: emCm(recuoFundo),
        esquerda: emCm(recuoEsquerda), direita: emCm(recuoDireita),
      };
      if (Object.values(recuos).some(valor => valor !== undefined)) lote.recuos = recuos;
    }
    aoConfirmar(lote);
  }
</script>

<div class="text-left">
  <p class="mb-4 text-sm text-gray-500">{$t('lote.explicacao')}</p>

  <!-- Medidas de lote mais comuns, para quem já sabe o terreno e não quer digitar. -->
  <div class="mb-4 flex flex-wrap gap-1.5">
    {#each [[10, 20], [10, 25], [12, 30], [15, 30]] as [frente, fundo] (`${frente}x${fundo}`)}
      <button
        type="button"
        class="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 active:border-blue-400 active:text-blue-700"
        onclick={() => { largura = String(frente); profundidade = String(fundo); }}
      >{frente}×{fundo} m</button>
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-3">
    <label class="block">
      <span class="text-xs font-medium text-gray-600">{$t('lote.largura')}</span>
      <input
        type="text" inputmode="decimal" bind:value={largura}
        class="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2.5 text-base focus:border-blue-400 focus:outline-none"
      />
    </label>
    <label class="block">
      <span class="text-xs font-medium text-gray-600">{$t('lote.profundidade')}</span>
      <input
        type="text" inputmode="decimal" bind:value={profundidade}
        class="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2.5 text-base focus:border-blue-400 focus:outline-none"
      />
    </label>
  </div>

  <fieldset class="mt-4">
    <legend class="text-xs font-medium text-gray-600">{$t('lote.frente')}</legend>
    <div class="mt-1 grid grid-cols-4 gap-1.5">
      {#each lados as lado (lado.valor)}
        <button
          type="button"
          class="min-h-10 rounded-lg border-2 px-1 text-xs font-medium transition-colors {frente === lado.valor
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-600'}"
          aria-pressed={frente === lado.valor}
          onclick={() => frente = lado.valor}
        >{$t(lado.chave as Parameters<typeof $t>[0])}</button>
      {/each}
    </div>
  </fieldset>

  <label class="mt-4 flex items-center gap-2 text-sm text-gray-600">
    <input type="checkbox" bind:checked={mostrarRecuos} class="h-4 w-4 rounded border-gray-300" />
    {$t('lote.recuos')}
  </label>

  {#if mostrarRecuos}
    <div class="mt-2 grid grid-cols-4 gap-1.5">
      {#each [
        { chave: 'lote.recuoFrente', get: () => recuoFrente, set: (v: string) => recuoFrente = v },
        { chave: 'lote.recuoFundo', get: () => recuoFundo, set: (v: string) => recuoFundo = v },
        { chave: 'lote.recuoEsquerda', get: () => recuoEsquerda, set: (v: string) => recuoEsquerda = v },
        { chave: 'lote.recuoDireita', get: () => recuoDireita, set: (v: string) => recuoDireita = v },
      ] as campo (campo.chave)}
        <label class="block">
          <span class="text-[11px] text-gray-500">{$t(campo.chave as Parameters<typeof $t>[0])}</span>
          <input
            type="text" inputmode="decimal" value={campo.get()}
            oninput={(e) => campo.set(e.currentTarget.value)}
            class="mt-0.5 w-full rounded-lg border-2 border-gray-200 px-2 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
        </label>
      {/each}
    </div>
  {/if}

  {#if area !== null}
    <p class="mt-4 text-sm font-medium text-emerald-700">{$t('lote.area', { area: area.toFixed(0) })}</p>
  {:else}
    <p role="alert" class="mt-4 text-sm text-red-700">{$t('lote.medidaInvalida')}</p>
  {/if}

  <div class="mt-5 flex flex-col gap-2">
    <button
      type="button"
      class="min-h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400"
      disabled={!valido}
      onclick={confirmar}
    >{$t('lote.definir')}</button>
    <button type="button" class="min-h-10 text-sm font-medium text-gray-500 underline" onclick={aoPular}>
      {rotuloPular ?? $t('lote.pular')}
    </button>
  </div>
</div>
