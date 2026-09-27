import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada caso de estudio vive en su propia carpeta:
// src/content/case-studies/<slug>/index.mdx  (+ sus imágenes al lado)
const caseStudies = defineCollection({
  loader: glob({ pattern: '*/index.mdx', base: './src/content/case-studies' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      // Imágenes del panel derecho en el home
      gallery: z.array(image()).min(1),
      galleryAlt: z.string(),
      // Cómo se acomodan las imágenes en el panel:
      //  - devices: varias pantallas en fila, centradas (ej. 3 celulares)
      //  - centered: una imagen centrada con aire alrededor
      //  - bleed: una imagen alineada a la izquierda que se corta por la derecha
      galleryLayout: z.enum(['devices', 'centered', 'bleed']).default('centered'),
      // Portada de la página del caso (por defecto, la primera de la galería)
      cover: image().optional(),
      company: z.string().optional(),
      role: z.string().optional(),
      year: z.number().optional(),
      duration: z.string().optional(),
      team: z.string().optional(),
      // Orden en el home (menor = primero)
      order: z.number().default(99),
      draft: z.boolean().default(false),
    }),
});

export const collections = { caseStudies };
