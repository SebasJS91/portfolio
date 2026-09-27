// Micro-interacciones globales. Se re-inicializan en cada navegación
// porque usamos View Transitions (ClientRouter).

let revealObserver: IntersectionObserver | undefined;

function initReveal() {
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver?.observe(el));
}

function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('[data-copy-label]');
    const original = label?.textContent ?? '';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        if (label) label.textContent = 'Copied!';
        button.classList.add('is-copied');
        setTimeout(() => {
          if (label) label.textContent = original;
          button.classList.remove('is-copied');
        }, 1800);
      } catch {
        window.location.href = `mailto:${button.dataset.copy}`;
      }
    });
  });
}

function initReadingProgress(signal: AbortSignal) {
  const bar = document.querySelector<HTMLElement>('[data-reading-progress]');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true, signal });
}

/* --------------------------------------------------------------------------
   Dock (elemento flotante + menú)
   body[data-dock]  → hero | bar | top
   body[data-zone]  → sección actual (hero, work, footer, …)
   body[data-menu]  → open | closed
   -------------------------------------------------------------------------- */

function initDock(signal: AbortSignal) {
  const body = document.body;
  const root = document.documentElement;
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-dock-menu]');
  const label = document.querySelector<HTMLElement>('[data-dock-label]');
  if (!dock || !toggle || !menu || !label) return;

  const hero = document.querySelector<HTMLElement>('[data-zone="hero"]');
  const footer = document.querySelector<HTMLElement>('[data-zone="footer"]');
  const sections = [...document.querySelectorAll<HTMLElement>('[data-zone]')].filter(
    (el) => el !== hero && el !== footer,
  );

  // focusFirst: al abrir con teclado, el foco pasa a la primera opción
  const setMenu = (open: boolean, focusFirst = false) => {
    body.dataset.menu = open ? 'open' : 'closed';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.inert = !open;
    if (open && focusFirst) menu.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
  };

  const setLabel = (text: string) => {
    if (label.textContent === text) return;
    label.textContent = text;
    label.classList.remove('is-rolling');
    void label.offsetWidth; // reinicia la animación
    label.classList.add('is-rolling');
  };

  const update = () => {
    const vh = window.innerHeight;
    let dockState: 'hero' | 'bar' | 'top' = 'bar';
    let zone = body.dataset.zone ?? '';

    // El dock solo se contrae al botón de volver arriba cuando la página toca fondo
    // (margen de 8px para trackpads y redondeos); si se sube un poco, vuelve a la barra.
    const atBottom = window.scrollY + vh >= root.scrollHeight - 8;

    if (footer && atBottom) {
      dockState = 'top';
      zone = 'footer';
    } else if (hero && hero.getBoundingClientRect().bottom > vh * 0.85) {
      // Apenas empieza el scroll fuera del hero, el dock se compacta
      dockState = 'hero';
      zone = 'hero';
    } else {
      const current = sections.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= vh / 2 && r.bottom >= vh / 2;
      });
      if (current) {
        zone = current.dataset.zone ?? zone;
        if (current.dataset.label) setLabel(current.dataset.label);
      } else if (footer && footer.getBoundingClientRect().top < vh / 2) {
        // Entrando al footer: la barra sigue completa con la última sección
        zone = 'footer';
      } else if (sections[0]?.dataset.label) {
        setLabel(sections[0].dataset.label);
      }
    }

    // Al cambiar de estado se cierra el menú (p. ej. llegar al footer)
    if (body.dataset.dock && body.dataset.dock !== dockState && body.dataset.menu === 'open') setMenu(false);
    body.dataset.dock = dockState;
    body.dataset.zone = zone;
  };

  let frame = 0;
  const onScroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };

  const setViewport = () => root.style.setProperty('--vw', `${root.clientWidth}px`);

  setViewport();
  setMenu(false);
  update();

  window.addEventListener('scroll', onScroll, { passive: true, signal });
  window.addEventListener(
    'resize',
    () => {
      setViewport();
      onScroll();
    },
    { signal },
  );

  // event.detail === 0 → el click vino del teclado (Enter / Espacio)
  toggle.addEventListener(
    'click',
    (event) => setMenu(body.dataset.menu !== 'open', event.detail === 0),
    { signal },
  );

  document.querySelectorAll('[data-menu-close]').forEach((el) =>
    el.addEventListener('click', () => setMenu(false), { signal }),
  );

  // Elegir una opción del menú lo cierra
  menu.addEventListener(
    'click',
    (event) => {
      if ((event.target as HTMLElement).closest('a')) setMenu(false);
    },
    { signal },
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && body.dataset.menu === 'open') {
        setMenu(false);
        toggle.focus();
      }
    },
    { signal },
  );
}

let controller: AbortController | undefined;

document.addEventListener('astro:page-load', () => {
  controller?.abort();
  controller = new AbortController();
  initDock(controller.signal);
  initReveal();
  initCopyButtons();
  initReadingProgress(controller.signal);
});
