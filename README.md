# Portafolio — Sebastian Jaramillo

Sitio construido con [Astro](https://astro.build). Estático, rápido y fácil de editar.

## Comandos

| Comando           | Qué hace                                    |
| ----------------- | ------------------------------------------- |
| `npm install`     | Instala dependencias                        |
| `npm run dev`     | Servidor local en `http://localhost:4321`   |
| `npm run build`   | Genera el sitio final en `dist/`            |
| `npm run preview` | Previsualiza el build                       |
| `npm run cf:dev`  | Build + simula Cloudflare en local          |
| `npm run cf:deploy` | Build + publica en Cloudflare (manual)    |

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

El sitio está en inglés (`/`) y español (`/es/`). Las páginas de `src/pages`
solo eligen el idioma; el contenido vive en `src/views`.

En la primera visita al inicio el idioma se elige solo. Prioridad:

1. Lo que el visitante eligió en el modal de Language (se recuerda).
2. En Cloudflare: el país de la visita (`worker/index.js`). Países
   hispanohablantes → `/es/`, el resto → inglés.
3. En cualquier hosting: el idioma principal del navegador.

Los links directos a una página (un caso, `/es/...`) nunca se redirigen.

## Publicación

El sitio se puede servir en dos lugares; la ruta base se define por variables
de entorno (ver `astro.config.mjs`):

| Dónde          | URL                                   | Variables                                      |
| -------------- | ------------------------------------- | ---------------------------------------------- |
| GitHub Pages   | `https://sebasjs91.github.io/portfolio` | `SITE_BASE=/portfolio` (lo pone el workflow)   |
| Cloudflare     | `https://sebastianjaramillo.me`       | ninguna (es el valor por defecto)              |
| Local          | `http://localhost:4321`               | ninguna                                        |

### Cloudflare (dominio propio + idioma por país)

1. Crea una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com).
2. Compra el dominio en **Domain Registration → Register Domains**.
3. Ve a **Workers & Pages → Create → Import a repository**, conecta GitHub y
   elige `SebasJS91/portfolio`:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
4. En el Worker creado: **Settings → Domains & Routes → Add → Custom domain**
   y escribe `sebastianjaramillo.me` (y `www.sebastianjaramillo.me` si quieres).
5. Desde ahí, cada push a `main` se publica solo en Cloudflare.

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
