// Antepone la base del sitio (ej. /portfolio en GitHub Pages) a las rutas internas.
// Deja intactos mailto:, tel:, anclas (#...) y links externos.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path = '/') {
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
}
