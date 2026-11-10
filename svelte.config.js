import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // O aplicativo roda inteiro no navegador: não há servidor, banco nem conta.
    // A saída é um site estático, que a Vercel publica de graça.
    adapter: adapter({ fallback: 'index.html', strict: false }),
  },
};

export default config;
