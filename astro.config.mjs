// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: reemplazar por tu dominio cuando lo tengas
  site: 'https://tudominio.com',
  integrations: [mdx(), sitemap()],
});
