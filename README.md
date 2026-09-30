# Portafolio — Sebastian Jaramillo

Sitio construido con [Astro](https://astro.build). Estático, rápido y fácil de editar.

## Comandos

| Comando           | Qué hace                                    |
| ----------------- | ------------------------------------------- |
| `npm install`     | Instala dependencias                        |
| `npm run dev`     | Servidor local en `http://localhost:4321`   |
| `npm run build`   | Genera el sitio final en `dist/`            |
| `npm run preview` | Previsualiza el build                       |

## Dónde editar cada cosa

| Qué                                  | Archivo                                   |
| ------------------------------------ | ----------------------------------------- |
| Nombre, email, links, menú           | `src/data/site.ts`                        |
| Textos de la interfaz (EN / ES)      | `src/i18n/ui.ts`                          |
| Colores, tipografía, espaciado       | `src/styles/global.css` (bloque `:root`)  |
| Home                                 | `src/views/HomeView.astro`                |
| Sobre mí y experiencia               | `src/views/AboutView.astro`               |
| CV                                   | `public/cv/cv.pdf`                        |
| Dominio                              | `astro.config.mjs` → `site`               |

## Idiomas

El sitio está en inglés (`/portfolio/`) y español (`/portfolio/es/`). Las páginas
de `src/pages` solo eligen el idioma; el contenido vive en `src/views`.

## Agregar un caso de estudio

1. Duplica una carpeta en `src/content/case-studies/` y renómbrala. El nombre de la carpeta será la URL (`/work/nombre-carpeta`).
2. Pon tus imágenes dentro de la misma carpeta (PNG, JPG o WebP; Astro las optimiza solo).
3. Edita `index.mdx` (inglés): los datos de arriba (entre `---`) alimentan la sección del home y el encabezado del caso.
4. Para la versión en español crea `index.es.mdx` en la misma carpeta. Solo necesita los campos que cambian (`title`, `summary`, `tags`, `galleryAlt`, `role`…); imágenes, orden y layout se heredan del inglés. Si no existe, la página en español muestra el caso en inglés.
5. `draft: true` oculta el caso en producción (sigue visible en local).
6. `order` define el orden en el home.

Componentes disponibles dentro del MDX:

```mdx
import Figure from '../../../components/mdx/Figure.astro';
import Metrics from '../../../components/mdx/Metrics.astro';
import pantalla from './pantalla.png';

<Figure src={pantalla} alt="Descripción" caption="Pie de foto" wide />
<Metrics items={[{ value: '+32%', label: 'conversión' }]} />
```

## Micro-interacciones incluidas

- Entrada escalonada del hero
- Aparición al hacer scroll: agrega `data-reveal` a cualquier elemento
- Transición animada de la portada entre el home y el caso (View Transitions)
- Hover en cards (zoom de imagen y flecha)
- Subrayado animado en links
- Botón que copia el email con feedback
- Barra de progreso de lectura en los casos de estudio
- Todo respeta `prefers-reduced-motion`
