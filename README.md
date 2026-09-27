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
| Nombre, tagline, email, links, menú  | `src/data/site.ts`                        |
| Colores, tipografía, espaciado       | `src/styles/global.css` (bloque `:root`)  |
| Home                                 | `src/pages/index.astro`                   |
| Sobre mí y experiencia               | `src/pages/about.astro`                   |
| CV                                   | `public/cv/cv.pdf`                        |
| Dominio                              | `astro.config.mjs` → `site`               |

## Agregar un caso de estudio

1. Duplica una carpeta en `src/content/case-studies/` y renómbrala. El nombre de la carpeta será la URL (`/work/nombre-carpeta`).
2. Pon tus imágenes dentro de la misma carpeta (PNG, JPG o WebP; Astro las optimiza solo).
3. Edita `index.mdx`: los datos de arriba (entre `---`) alimentan la card del home y el encabezado del caso.
4. `draft: true` oculta el caso en producción (sigue visible en local).
5. `order` define el orden en el home.

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
