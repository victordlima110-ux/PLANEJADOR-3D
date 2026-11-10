<script lang="ts">
  import { t } from '$lib/i18n';
  import { selectedTool, placingDoorType, placingWindowType, placingFurnitureId, showFurnitureStore, type Tool } from '$lib/stores/project';

  let { aoAbrirFerramentas, ferramentasAbertas = false }: {
    aoAbrirFerramentas: () => void;
    ferramentasAbertas?: boolean;
  } = $props();

  let ferramenta = $state<Tool>('select');
  selectedTool.subscribe((valor) => { ferramenta = valor; });

  function escolher(alvo: Tool) {
    // Tocar de novo na ferramenta ativa volta para a seta, para sair do modo de desenho.
    const proxima: Tool = ferramenta === alvo ? 'select' : alvo;
    if (proxima === 'door') placingDoorType.set('single');
    if (proxima === 'window') placingWindowType.set('standard');
    placingFurnitureId.set(null);
    selectedTool.set(proxima);
  }

  function abrirMoveis() {
    showFurnitureStore.set(true);
    aoAbrirFerramentas();
  }
</script>

<!--
  Barra inferior só do celular: as quatro ações usadas o tempo todo ficam ao alcance
  do polegar, com alvos de toque grandes, em vez de ficarem dentro do painel lateral.
-->
<nav
  class="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur shadow-[0_-2px_12px_rgba(15,23,42,0.12)]"
  style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  aria-label={$t('editorPanels.tools')}
>
  <button
    type="button"
    class="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium transition-colors {ferramentasAbertas ? 'text-blue-600' : 'text-slate-600'}"
    onclick={aoAbrirFerramentas}
    aria-expanded={ferramentasAbertas}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    {$t('barraCelular.ferramentas')}
  </button>

  {#each [
    { alvo: 'select' as Tool, rotulo: $t('barraCelular.selecionar'), caminho: 'M3 2l7.5 18 2.6-7.4L20.5 10z' },
    { alvo: 'wall' as Tool, rotulo: $t('barraCelular.parede'), caminho: 'M3 9h18M3 15h18M3 4v16M21 4v16' },
    { alvo: 'door' as Tool, rotulo: $t('barraCelular.porta'), caminho: 'M4 21h16M6 21V4h9v17M12 13h.01' },
    { alvo: 'window' as Tool, rotulo: $t('barraCelular.janela'), caminho: 'M4 5h16v14H4zM12 5v14M4 12h16' },
  ] as item (item.alvo)}
    <button
      type="button"
      class="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium transition-colors {ferramenta === item.alvo ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}"
      onclick={() => escolher(item.alvo)}
      aria-pressed={ferramenta === item.alvo}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={item.caminho}/></svg>
      <span class="max-w-full truncate">{item.rotulo}</span>
    </button>
  {/each}

  <button
    type="button"
    class="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium text-slate-600 transition-colors"
    onclick={abrirMoveis}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M4 14h16M6 18v2M18 18v2M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></svg>
    <span class="max-w-full truncate">{$t('barraCelular.moveis')}</span>
  </button>
</nav>
