import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { catalogAssets } from './tooling/catalog-assets.mjs';

export default defineConfig({
  plugins: [catalogAssets(), tailwindcss(), sveltekit()],
});
