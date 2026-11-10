<script lang="ts">
  import { t } from '$lib/i18n';
  import { getActiveTip, dismissTip } from '$lib/stores/onboarding.svelte';
  import { telaPequena } from '$lib/stores/telaPequena';

  let tip = $derived(getActiveTip());
  let visible = $state(false);
  let viewportWidth = $state(1200);
  let viewportHeight = $state(800);
  let tipWidth = $state(280);
  let tipHeight = $state(0);
  const margin = 8;

  let left = $derived(tip ? Math.max(margin, Math.min(tip.x, viewportWidth - tipWidth - margin)) : margin);
  let top = $derived(tip ? Math.max(margin, Math.min(tip.y, viewportHeight - tipHeight - margin)) : margin);

  /**
   * No celular a dica não segue o ponto que a disparou: ali em cima ficam os
   * botões de ação, e uma dica por cima deles esconde justamente o que a pessoa
   * precisa tocar. Então ela encosta embaixo, logo acima da barra de ferramentas.
   */
  let posicao = $derived($telaPequena
    ? `left:${margin}px;right:${margin}px;bottom:calc(5.5rem + env(safe-area-inset-bottom, 0px));width:auto;max-height:${Math.max(0, viewportHeight / 2)}px;`
    : `left:${left}px;top:${top}px;width:${Math.max(0, Math.min(280, viewportWidth - margin * 2))}px;max-height:${Math.max(0, viewportHeight - margin * 2)}px;`);

  $effect(() => {
    visible = false;
    if (tip) {
      const frame = requestAnimationFrame(() => { visible = true; });
      const timer = setTimeout(dismissTip, 8000);
      // Resizing only changes placement; it must not restart the dismissal timer.
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  });
</script>

<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

{#if tip}
  <div
    role="region"
    aria-label={$t('onboarding.title')}
    bind:offsetWidth={tipWidth}
    bind:offsetHeight={tipHeight}
    class="fixed z-[9999] pointer-events-auto flex flex-col gap-2 bg-slate-800 text-white rounded-xl shadow-2xl px-4 py-3 text-sm leading-relaxed transition-opacity duration-300 ease-out max-w-[calc(100vw-1rem)]"
    class:opacity-0={!visible}
    class:opacity-100={visible}
    style={posicao}
  >
    <p class="min-h-0 overflow-y-auto">{$t($telaPequena ? `onboarding.${tip.id}.toque` : `onboarding.${tip.id}`)}</p>
    <button
      class="shrink-0 self-start text-xs font-medium px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors"
      onclick={dismissTip}
    >{$t('onboarding.dismiss')}</button>
  </div>
{/if}
