// Worker de Cloudflare: decide el idioma de la primera visita según el país.
// Solo se ejecuta en "/" (ver run_worker_first en wrangler.jsonc); todo lo
// demás se sirve directo como archivo estático.
//
// Prioridad:
//  1. Cookie "lang": lo que el visitante eligió en el modal de Language
//  2. Cookie "geo-lang": la decisión por país que ya se tomó antes
//  3. País de la IP (request.cf.country): países hispanohablantes → /es/
//
// En hostings sin worker (GitHub Pages) el script del <head> usa el idioma
// del navegador como respaldo.

/** Países donde el español es idioma principal (ISO 3166-1 alfa-2) */
const SPANISH_SPEAKING = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'ES', 'GQ', 'GT',
  'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE',
]);

const GEO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/' || request.method !== 'GET') return env.ASSETS.fetch(request);

    const cookies = parseCookies(request.headers.get('Cookie'));
    const decided = cookies.lang || cookies['geo-lang'];
    if (decided) return decided === 'es' ? redirectToSpanish(url) : env.ASSETS.fetch(request);

    // @ts-ignore request.cf solo existe en Cloudflare
    const country = request.cf?.country;
    const lang = SPANISH_SPEAKING.has(country) ? 'es' : 'en';
    const response = lang === 'es' ? redirectToSpanish(url) : withHeaders(await env.ASSETS.fetch(request));
    response.headers.append(
      'Set-Cookie',
      `geo-lang=${lang}; Path=/; Max-Age=${GEO_COOKIE_MAX_AGE}; SameSite=Lax; Secure`,
    );
    return response;
  },
};

function redirectToSpanish(url) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL('/es/', url).toString(),
      // La respuesta depende del visitante: que ningún caché la comparta
      'Cache-Control': 'private, no-store',
    },
  });
}

/** Copia la respuesta para poder modificar sus headers */
function withHeaders(response) {
  const copy = new Response(response.body, response);
  copy.headers.set('Cache-Control', 'private, no-cache');
  return copy;
}

function parseCookies(header) {
  /** @type {Record<string, string>} */
  const cookies = {};
  for (const part of (header || '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name) cookies[name] = decodeURIComponent(value.join('='));
  }
  return cookies;
}
