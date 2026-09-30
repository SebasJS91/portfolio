import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada caso de estudio vive en su propia carpeta:
//   src/content/case-studies/<slug>/index.mdx     → inglés (obligatorio)
//   src/content/case-studies/<slug>/index.es.mdx  → español (opcional)
// La versión en español solo necesita los campos que cambian (título, resumen,
// tags, textos alternativos…); el resto se hereda de la versión en inglés.
// Si no existe, la página en español muestra el caso en inglés.
const caseStudies = defineCollection({
  loader: glob({
    pattern: '*/index{,.es}.mdx',
    base: './src/content/case-studies',
    // project-01/index.mdx → "project-01" · project-01/index.es.mdx → "es/project-01"
    generateId: ({ entry }) => {
      const [slug, file] = entry.split('/');
      return file === 'index.es.mdx' ? `es/${slug}` : slug;
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      tags: z.array(z.string()).optional(),
      // Imágenes del panel derecho en el home
      gallery: z.array(image()).min(1).optional(),
      galleryAlt: z.string().optional(),
      // Cómo se acomodan las imágenes en el panel:
      //  - devices: varias pantallas en fila, centradas (ej. 3 celulares)
      //  - centered: una imagen centrada con aire alrededor
      //  - bleed: una imagen alineada a la izquierda que se corta por la derecha
      galleryLayout: z.enum(['devices', 'centered', 'bleed']).optional(),
      // Portada de la página del caso (por defecto, la primera de la galería)
      cover: image().optional(),
      company: z.string().optional(),
      role: z.string().optional(),
      year: z.number().optional(),
      duration: z.string().optional(),
      team: z.string().optional(),
      // Orden en el home (menor = primero)
      order: z.number().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = { caseStudies };
