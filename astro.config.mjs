// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Dónde vive el sitio: la raíz de sebastianjaramillo.me (Cloudflare). Para
// servirlo en otro lugar o en una subcarpeta, usa SITE_URL y SITE_BASE
// (ej. SITE_BASE=/portfolio). En desarrollo local corre en http://localhost:4321/
const site = process.env.SITE_URL || 'https://sebastianjaramillo.me';
const base = process.env.SITE_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  // Inglés en la raíz (/...) y español en /es/...
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
