<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { initializeLocale } from '$lib/i18n';
  import { themePreference } from '$lib/stores/theme';
  import DeploymentNotice from '$lib/components/DeploymentNotice.svelte';

  onMount(initializeLocale);
  let { children } = $props();
</script>

{@render children()}
<DeploymentNotice />
