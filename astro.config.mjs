// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: reemplazar por tu dominio cuando lo tengas
  site: 'https://sebasjs91.github.io',
  // Repo SebasJS91/portfolio → la página vive en /portfolio. Si cambias a un dominio propio, quita esta línea.
  base: '/portfolio',
  // Inglés en la raíz (/portfolio/...) y español en /portfolio/es/...
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
  ],
});
