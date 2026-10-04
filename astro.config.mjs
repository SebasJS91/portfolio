// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Dónde vive el sitio. Por defecto, el dominio propio en Cloudflare (en la raíz).
// GitHub Pages lo sobrescribe desde su workflow: SITE_URL=https://sebasjs91.github.io
// y SITE_BASE=/portfolio. En desarrollo local corre en http://localhost:4321/
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
