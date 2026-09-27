// Datos generales del sitio: edítalos aquí y se actualizan en todas las páginas.
export const site = {
  name: 'Sebastian Jaramillo',
  role: 'Product Designer',
  description:
    'Portfolio of Sebastian Jaramillo, Product Designer. Case studies in product design, UX and interfaces.',
  email: 'jara.sjs@gmail.com',
  cv: '/cv/cv.pdf',
  links: [{ label: 'Linkedin', href: 'https://www.linkedin.com/in/tu-usuario' }],
  // Opciones del menú. Language y Display Mode quedan listas para conectar su comportamiento.
  menu: [
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/#work' },
    { label: 'Contact', href: 'mailto:jara.sjs@gmail.com' },
    { label: 'Language', action: 'language' },
    { label: 'Display Mode', action: 'display-mode' },
  ],
};
