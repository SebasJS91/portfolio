// Datos generales del sitio: edítalos aquí y se actualizan en todas las páginas.
// Los textos traducibles (rol, descripción, etiquetas) están en src/i18n/ui.ts.
import type { UIKey } from '../i18n/ui';

type MenuItem = { label: UIKey; href: string } | { label: UIKey; action: 'about' | 'contact' | 'language' | 'display-mode' };

export const site = {
  name: 'Sebastian Jaramillo',
  email: 'jara.sjs@gmail.com',
  cv: '/cv/cv.pdf',
  links: [{ label: 'Linkedin', href: 'https://www.linkedin.com/in/tu-usuario' }],
  // Opciones del menú. Las rutas internas se traducen al idioma de la página.
  menu: [
    // About y Contact abren el panel lateral (Contact baja directo a esa sección)
    { label: 'menu.about', action: 'about' },
    { label: 'menu.work', href: '/#work' },
    { label: 'menu.contact', action: 'contact' },
    { label: 'menu.language', action: 'language' },
    { label: 'menu.displayMode', action: 'display-mode' },
  ] satisfies MenuItem[] as MenuItem[],
};
