# Borradores de casos de estudio

Esta carpeta es para **escribir y editar** los casos de estudio antes de
publicarlos. No forma parte del sitio: nada de aquí se publica.

> **Privado:** el repositorio en GitHub es público, así que todo lo que está
> dentro de `drafts/` está ignorado por Git (excepto esta guía y la plantilla).
> Puedes incluir notas internas, datos de clientes o métricas sin que se suban.

## Cómo organizarlos

Una carpeta por caso, con el nombre que tendrá su URL (minúsculas, guiones):

```
drafts/case-studies/
  nombre-del-caso/
    nombre-del-caso.en.md   ← versión en inglés
    nombre-del-caso.es.md   ← versión en español
    images/           ← capturas, exports de Figma (PNG, JPG o WebP)
    nombre-del-caso-notes.md ← opcional: notas internas, entrevistas, datos crudos
```

El nombre de la carpeta será la URL publicada:
`sebastianjaramillo.me/work/nombre-del-caso`.

Copia `_template.md` para empezar cada caso.

## Estructura y voz

Referencias: el caso de Cineo (estructura) y la entrevista a Jenny Wen (tono).

**Orden recomendado**
1. **¿Qué es X?**: qué es el producto, para quién y qué hace, en 2–3 frases.
2. **De un vistazo**: rol, alcance, decisiones clave y resultado, en 4 viñetas.
3. **Contexto**: de dónde salió el proyecto y cuál era el problema.
4. Las secciones del trabajo (decisiones, investigación, solución). Cada una explica el *por qué*.
5. **Resultados**: con estado (confirmado, pendiente) y sin superlativos.
6. **Lo que me llevo**: aprendizajes honestos, incluido lo que no se validó.

**Voz**
- Primera persona ("yo"), palabras sencillas, sin jerga corporativa.
- Mezcla frases cortas con otras más largas. Una pregunta o un "en palabras simples" está bien.
- Cuenta lo que no salió perfecto. Eso es lo que lo hace humano.
- No inventes sentimientos ni anécdotas: usa solo lo que realmente pasó.

## Qué necesita cada caso para publicarse

Los datos de arriba (entre `---`) alimentan la sección del caso en el home
y el encabezado de su página. Ver `_template.md` para el detalle de cada campo.

| Campo | Para qué se usa | Obligatorio |
|---|---|---|
| `title` | Título en el home y en la página del caso | Sí |
| `summary` | Descripción corta (1–2 frases) bajo el título | Sí |
| `tags` | Etiquetas (máx. ~6, cortas) | Recomendado |
| `company`, `role`, `year`, `duration`, `team` | Ficha del proyecto en la página del caso | Opcional |
| `gallery` | Imágenes del panel derecho en el home | Sí (en inglés) |
| `galleryLayout` | `devices` (varias pantallas en fila), `centered` (una imagen centrada) o `bleed` (una imagen que se corta por la derecha) | Sí (en inglés) |
| `galleryAlt` | Descripción de las imágenes (accesibilidad) | Sí |

La versión en español solo necesita lo que cambia: `title`, `summary`,
`tags`, `galleryAlt`, y los textos de `role`, `duration`, `team`. Las
imágenes, el orden y el layout se toman del inglés.

## Componentes que se pueden usar en el texto

Al publicarlos, el texto Markdown se convierte en MDX. Además de títulos
(`##`, `###`), párrafos, listas, negritas y citas (`>`), existen:

- **Imagen con pie de foto** (puede ocupar el ancho completo):
  escribe en el borrador `[Imagen: images/flujo.png | Pie de foto | ancho completo]`
- **Métricas de impacto** (tarjetas con número + etiqueta):
  escribe `[Métricas: -38% abandono en registro; +21% cuentas verificadas]`

Al montarlos en el sitio se reemplazan por los componentes reales.

## Cuando un caso esté listo

Avisa en el chat del sitio con el nombre de la carpeta. Ahí se pasa a
`src/content/case-studies/<nombre>/` (MDX + imágenes optimizadas), se
revisa cómo se ve y se publica.
