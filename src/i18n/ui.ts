// Textos de la interfaz en cada idioma. El contenido de los casos de estudio
// vive en sus archivos MDX (index.mdx en inglés, index.es.mdx en español).
import { url } from '../utils/url';

export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'site.role': 'Product Designer',
    'site.description':
      'Portfolio of Sebastian Jaramillo, Product Designer. Case studies in product design, UX and interfaces.',
    'a11y.skip': 'Skip to content',
    'a11y.home': 'home',
    'a11y.openMenu': 'Open menu',
    'a11y.closeMenu': 'Close menu',
    'a11y.backToTop': 'Back to top',

    'section.home': 'Home',
    'section.work': 'Work',
    'section.about': 'About',
    'section.case': 'Case Study',

    'menu.title': 'Menu',
    'menu.about': 'About',
    'menu.work': 'Work',
    'menu.contact': 'Contact',
    'menu.language': 'Language',
    'menu.displayMode': 'Display Mode',

    'display.title': 'Display Mode',
    'display.auto': 'Auto (follow system settings)',
    'display.light': 'Light',
    'display.dark': 'Dark',
    'language.title': 'Language',
    'panel.done': 'Done',

    'case.eyebrow': 'Case Study',
    'case.cta': 'View Case Study',
    'case.next': 'Next Case Study',
    'case.company': 'Company',
    'case.role': 'Role',
    'case.year': 'Year',
    'case.team': 'Team',
    'case.toc': 'On this page',

    'about.title': 'About',
    'about.p1': 'There’s a version of design that looks great, tests well, and never gets built. I’m not interested in that version.',
    'about.p2':
      'I work with product teams to turn ideas and complex problems into products that work for real users, hold up in development, and move the business forward. Those three things only happen when everyone building it feels true ownership over the work, not just accountability for a task. That’s the environment I work to create.',
    'about.p3':
      'Across the projects I’ve led, from first concept to shipped product, some secured grant funding, attracted early investment, and earned a second phase from clients who trusted the work enough to keep going. That track record also includes a white-label product and design system built from scratch that now helps my company move faster across every new client engagement.',
    'about.p4':
      'I start by understanding the project before I start designing for the user. What does the client actually need? Why are we building this? What are we trying to achieve? When those questions are clear, everything else, the design, the pivots, and the tradeoffs, becomes much easier to navigate. And that’s when the best work happens.',
    'about.contact': 'Contact',
    'about.close': 'Close About',
    'copy.done': 'Copied!',
  },
  es: {
    'site.role': 'Product Designer',
    'site.description':
      'Portafolio de Sebastian Jaramillo, Product Designer. Casos de estudio de diseño de producto, UX e interfaces.',
    'a11y.skip': 'Saltar al contenido',
    'a11y.home': 'inicio',
    'a11y.openMenu': 'Abrir menú',
    'a11y.closeMenu': 'Cerrar menú',
    'a11y.backToTop': 'Volver arriba',

    'section.home': 'Inicio',
    'section.work': 'Trabajo',
    'section.about': 'Sobre mí',
    'section.case': 'Caso de estudio',

    'menu.title': 'Menú',
    'menu.about': 'Sobre mí',
    'menu.work': 'Trabajo',
    'menu.contact': 'Contacto',
    'menu.language': 'Idioma',
    'menu.displayMode': 'Apariencia',

    'display.title': 'Apariencia',
    'display.auto': 'Automático (según el sistema)',
    'display.light': 'Claro',
    'display.dark': 'Oscuro',
    'language.title': 'Idioma',
    'panel.done': 'Listo',

    'case.eyebrow': 'Caso de estudio',
    'case.cta': 'Ver caso de estudio',
    'case.next': 'Siguiente caso',
    'case.company': 'Empresa',
    'case.role': 'Rol',
    'case.year': 'Año',
    'case.team': 'Equipo',
    'case.toc': 'En esta página',

    'about.title': 'Sobre mí',
    'about.p1': 'Hay una versión del diseño que se ve increíble, sale bien en las pruebas y nunca se construye. Esa versión no me interesa.',
    'about.p2':
      'Trabajo con equipos de producto para convertir ideas y problemas complejos en productos que funcionan para usuarios reales, sobreviven al desarrollo y hacen avanzar el negocio. Para lograr las tres cosas, quienes lo construyen tienen que sentir el trabajo como suyo, y no solo cumplir con una tarea. Ese es el ambiente que busco crear.',
    'about.p3':
      'He liderado proyectos desde el primer concepto hasta el producto lanzado. Algunos consiguieron financiación en convocatorias, otros atrajeron inversión temprana, y otros ganaron una segunda fase con clientes que confiaron en el trabajo y quisieron seguir. También creé desde cero un producto white-label y un design system que hoy le ayudan a mi empresa a avanzar más rápido con cada nuevo cliente.',
    'about.p4':
      'Antes de diseñar empiezo por entender el proyecto: ¿qué necesita realmente el cliente?, ¿por qué estamos construyendo esto?, ¿qué queremos lograr? Cuando esas preguntas están claras, el diseño, los cambios de rumbo y las decisiones difíciles se resuelven con mucha más facilidad.',
    'about.contact': 'Contacto',
    'about.close': 'Cerrar Sobre mí',
    'copy.done': '¡Copiado!',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)['en'];

/** Idioma de la página actual (Astro.currentLocale) */
export function getLang(locale: string | undefined): Lang {
  return locale && locale in languages ? (locale as Lang) : defaultLang;
}

export function useTranslations(lang: Lang) {
  return (key: UIKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

/** Ruta interna con prefijo de idioma y base: ('es', '/about') → /portfolio/es/about */
export function localizedUrl(lang: Lang, path = '/') {
  if (!path.startsWith('/')) return path; // mailto:, #ancla, links externos
  return url(lang === defaultLang ? path : `/${lang}${path === '/' ? '/' : path}`);
}

/** La misma página en otro idioma: /portfolio/work/x → /portfolio/es/work/x */
export function switchLanguageUrl(pathname: string, target: Lang) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const [, first] = path.split('/');
  if (first && first in languages) path = path.slice(first.length + 1);
  return localizedUrl(target, path || '/');
}
