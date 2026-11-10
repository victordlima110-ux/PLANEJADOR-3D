import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // O programa roda inteiro no navegador: não há servidor, banco nem conta.
    // Como todas as páginas são pré-renderizadas (ver src/routes/+layout.ts),
    // a Vercel publica só arquivos estáticos — sem função serverless e sem custo.
    adapter: adapter(),
  },
};

export default config;
