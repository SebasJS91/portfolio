// Casos de estudio por idioma: combina la versión en inglés con su traducción
// (si existe), campo por campo.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { defaultLang, type Lang } from './ui';

type Entry = CollectionEntry<'caseStudies'>;
type Data = Entry['data'];

export type CaseStudy = {
  /** Slug de la URL (nombre de la carpeta) */
  slug: string;
  /** Entrada cuyo cuerpo MDX se renderiza (la traducción, o el inglés si no hay) */
  entry: Entry;
  /** true si la página muestra la versión en inglés por falta de traducción */
  isFallback: boolean;
  data: Required<Pick<Data, 'title' | 'summary' | 'tags' | 'galleryAlt' | 'galleryLayout' | 'order' | 'draft'>> &
    Omit<Data, 'gallery' | 'cover'> & {
      gallery: ImageMetadata[];
      /** Portada propia para la página del caso; si no hay, se muestra la galería */
      cover?: ImageMetadata;
    };
};

export async function getCaseStudies(lang: Lang): Promise<CaseStudy[]> {
  const all = await getCollection('caseStudies');
  const base = all.filter((entry) => !entry.id.includes('/'));
  const translations = new Map(
    all.filter((entry) => entry.id.startsWith(`${lang}/`)).map((entry) => [entry.id.split('/')[1], entry]),
  );

  return base
    .map((en) => {
      const translation = lang === defaultLang ? undefined : translations.get(en.id);
      const merged = { ...en.data, ...stripUndefined(translation?.data ?? {}) };
      if (!merged.gallery?.length) {
        throw new Error(`El caso "${en.id}" necesita "gallery" en index.mdx`);
      }
      return {
        slug: en.id,
        entry: translation ?? en,
        isFallback: lang !== defaultLang && !translation,
        data: {
          ...merged,
          tags: merged.tags ?? [],
          galleryAlt: merged.galleryAlt ?? '',
          galleryLayout: merged.galleryLayout ?? 'centered',
          order: merged.order ?? 99,
          draft: merged.draft ?? false,
          gallery: merged.gallery,
          cover: merged.cover,
        },
      } satisfies CaseStudy;
    })
    .filter((study) => import.meta.env.DEV || !study.data.draft)
    .sort((a, b) => a.data.order - b.data.order);
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
}
