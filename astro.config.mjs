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
  integrations: [mdx(), sitemap()],
});
