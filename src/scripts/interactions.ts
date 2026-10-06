// Micro-interacciones globales. Se re-inicializan en cada navegación
// porque usamos View Transitions (ClientRouter).
import { navigate } from 'astro:transitions/client';

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
        if (label) label.textContent = button.dataset.copied ?? 'Copied!';
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

// Índice lateral de los casos: marca la sección que se está leyendo
function initToc(signal: AbortSignal) {
  const nav = document.querySelector<HTMLElement>('[data-toc]');
  const cover = document.querySelector<HTMLElement>('[data-case-cover]');
  const footer = document.querySelector<HTMLElement>('[data-zone="footer"]');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a')];
  const targets = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((el): el is HTMLElement => !!el);
  if (!nav || !targets.length) return;

  let frame = 0;
  const update = () => {
    // Visible entre la imagen del proyecto (ya pasada) y el footer
    const vh = window.innerHeight;
    const pastCover = !cover || cover.getBoundingClientRect().bottom <= 120;
    const beforeFooter = !footer || footer.getBoundingClientRect().top > vh / 2;
    nav.toggleAttribute('data-visible', pastCover && beforeFooter);

    // La sección actual es la última cuyo título ya pasó el 30% superior de la pantalla
    const line = window.innerHeight * 0.3;
    let current = 0;
    targets.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= line) current = i;
    });
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    if (atBottom) current = targets.length - 1;
    links.forEach((link, i) => link.setAttribute('aria-current', String(i === current)));
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    },
    { passive: true, signal },
  );
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
  // div: el <body> también lleva data-dock (el estado de la barra)
  const dock = document.querySelector<HTMLElement>('div[data-dock]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-dock-menu]');
  const label = document.querySelector<HTMLElement>('[data-dock-label]');
  if (!dock || !toggle || !menu || !label) return;

  const hero = document.querySelector<HTMLElement>('[data-zone="hero"]');
  const footer = document.querySelector<HTMLElement>('[data-zone="footer"]');
  const sections = [...document.querySelectorAll<HTMLElement>('[data-zone]')].filter(
    (el) => el !== hero && el !== footer,
  );

  // Scroll (en px) que tolera cada gesto antes de reaccionar: absorbe redondeos
  // y el rebote de los trackpads, pero se siente inmediato.
  const SCROLL_SLOP = 4;
  // Posición del scroll al abrir el menú: si el usuario se mueve, se cierra
  let menuOpenedAt = 0;

  // focusFirst: al abrir con teclado, el foco pasa a la primera opción.
  // view: qué muestra el panel — el menú o uno de los modales.
  const setMenu = (open: boolean, focusFirst = false, view: MenuView = 'menu') => {
    // Al cerrar se conserva la vista para que no cambie durante la animación de salida
    if (open) {
      body.dataset.menuView = view;
      menuOpenedAt = window.scrollY;
    }
    body.dataset.menu = open ? 'open' : 'closed';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '');
    menu.inert = !open;
    document.dispatchEvent(new CustomEvent<MenuChange>('menu:change', { detail: { open, view } }));
    if (open && focusFirst) {
      const target =
        view === 'menu'
          ? menu.querySelector<HTMLElement>('.dock-menu__view--menu a, .dock-menu__view--menu button')
          : menu.querySelector<HTMLElement>(`.dock-menu__view--${view} [aria-checked="true"]`);
      target?.focus({ preventScroll: true });
    }
  };

  // La barra se ensancha para que el label quepa entero (100px como mínimo, como en Figma)
  const fitLabel = () => {
    const width = Math.ceil(label.getBoundingClientRect().width) + 8;
    dock.style.setProperty('--label-w', `${Math.max(100, width)}px`);
  };

  const setLabel = (text: string) => {
    if (label.textContent === text) return;
    label.textContent = text;
    fitLabel();
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
    } else if (hero && window.scrollY <= SCROLL_SLOP) {
      // Solo arriba del todo el logo y el menú están en su posición del hero;
      // con el primer movimiento de scroll se agrupan en la barra flotante
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
    // Hacer scroll con el menú abierto lo cierra (misma animación que la X)
    if (body.dataset.menu === 'open' && Math.abs(window.scrollY - menuOpenedAt) > SCROLL_SLOP) setMenu(false);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };

  const setViewport = () => root.style.setProperty('--vw', `${root.clientWidth}px`);

  setViewport();
  setMenu(false);
  update();
  fitLabel();
  // La fuente de display puede llegar después: se vuelve a medir al cargar
  document.fonts.ready.then(fitLabel);

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

  // "Display Mode" y "Language" (en el menú flotante o en el del footer) abren su modal
  const views: Record<string, MenuView> = { 'display-mode': 'display', language: 'language' };
  document.querySelectorAll<HTMLElement>('[data-menu-action]:not([data-menu-action="about"]):not([data-menu-action="contact"])').forEach((el) =>
    el.addEventListener(
      'click',
      (event) => setMenu(true, (event as MouseEvent).detail === 0, views[el.dataset.menuAction ?? ''] ?? 'menu'),
      { signal },
    ),
  );

  // Los modales piden cerrarse con este evento (p. ej. al presionar Done)
  document.addEventListener('menu:close', () => setMenu(false), { signal });

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

/* --------------------------------------------------------------------------
   Modales de opciones (Display Mode y Language)
   -------------------------------------------------------------------------- */

type MenuView = 'menu' | 'display' | 'language';
type MenuChange = { open: boolean; view: MenuView };
type DisplayMode = 'auto' | 'light' | 'dark';

declare global {
  interface Window {
    __theme?: { apply: () => void; getPref: () => DisplayMode };
  }
}

const closeMenu = () => document.dispatchEvent(new CustomEvent('menu:close'));

/**
 * Comportamiento de radiogroup: clic o flechas arriba/abajo eligen una opción.
 * Devuelve las opciones y una función para mover el check.
 */
function initOptionGroup(group: string, onSelect: (value: string) => void, signal: AbortSignal) {
  const options = [
    ...document.querySelectorAll<HTMLButtonElement>(`[data-option-group="${group}"] [data-option]`),
  ];

  const check = (value: string) =>
    options.forEach((option) => {
      const active = option.dataset.option === value;
      option.setAttribute('aria-checked', String(active));
      option.tabIndex = active ? 0 : -1; // solo la opción activa entra en el orden de tab
    });

  options.forEach((option, index) => {
    option.addEventListener('click', () => onSelect(option.dataset.option ?? ''), { signal });
    option.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const next = options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length];
        next.focus();
        onSelect(next.dataset.option ?? '');
      },
      { signal },
    );
  });

  return { options, check };
}

/* Display Mode: auto | light | dark.
   El script inline del <head> (BaseLayout) resuelve y aplica el tema; aquí se
   guarda la preferencia, se aplica al instante y se refleja en el modal. */
function initDisplayMode(signal: AbortSignal) {
  const { options, check } = initOptionGroup('display', (value) => select(value as DisplayMode), signal);
  if (!options.length) return;

  const sync = () => check(window.__theme?.getPref() ?? 'auto');

  function select(mode: DisplayMode) {
    try {
      localStorage.setItem('display-mode', mode);
    } catch {
      /* sin almacenamiento: el cambio vale solo para esta visita */
    }
    const apply = () => {
      window.__theme?.apply();
      sync();
    };
    // Transición suave entre temas cuando el navegador lo permite
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduced) document.startViewTransition(apply);
    else apply();
  }

  sync();

  document
    .querySelector('[data-option-group="display"] [data-options-done]')
    ?.addEventListener('click', closeMenu, { signal });

  // Si la preferencia es Auto y el sistema cambia de tema, el check sigue en Auto
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync, { signal });
}

/* Language: en | es. Elegir una opción solo mueve el check; Done lleva a la
   misma página en el idioma elegido (cada opción trae su URL en data-href). */
function initLanguage(signal: AbortSignal) {
  const current = document.documentElement.lang;
  let selected = current;
  const { options, check } = initOptionGroup(
    'language',
    (value) => {
      selected = value;
      check(value);
    },
    signal,
  );
  if (!options.length) return;

  // Al abrir el modal, el check vuelve al idioma de la página
  document.addEventListener(
    'menu:change',
    (event) => {
      const { open, view } = (event as CustomEvent<MenuChange>).detail;
      if (open && view === 'language') {
        selected = current;
        check(current);
      }
    },
    { signal },
  );

  document.querySelector('[data-option-group="language"] [data-options-done]')?.addEventListener(
    'click',
    () => {
      const href = options.find((option) => option.dataset.option === selected)?.dataset.href;
      if (selected === current || !href) return closeMenu();
      try {
        localStorage.setItem('language', selected);
      } catch {
        /* sin almacenamiento */
      }
      // La cookie la lee también el worker de Cloudflare, antes de servir la página
      document.cookie = `lang=${selected}; Path=/; Max-Age=31536000; SameSite=Lax`;
      navigate(href);
    },
    { signal },
  );
}

/* --------------------------------------------------------------------------
   Panel About: entra desde la derecha y empuja la página (y la barra flotante)
   hacia la izquierda. <body data-about="open|closed">.
   Se abre desde el botón About del hero/header, las opciones About y Contact
   del menú (Contact baja directo a esa sección) o con #about / #contact en la
   URL; se cierra con la X, la franja oscurecida o Escape.
   -------------------------------------------------------------------------- */
function initAbout(signal: AbortSignal) {
  const body = document.body;
  const panel = document.querySelector<HTMLElement>('[data-about-panel]');
  const page = document.querySelector<HTMLElement>('[data-page]');
  // div: el <body> también lleva data-dock (el estado de la barra)
  const dock = document.querySelector<HTMLElement>('div[data-dock]');
  if (!panel) return;

  let opener: HTMLElement | null = null;
  const isOpen = () => body.dataset.about === 'open';

  type Section = 'about' | 'contact';

  const setAbout = (open: boolean, section: Section = 'about') => {
    body.dataset.about = open ? 'open' : 'closed';
    panel.inert = !open;
    // Mientras está abierto, la página y la barra quedan fuera del foco y del teclado
    if (page) page.inert = open;
    if (dock) dock.inert = open;
    const url = new URL(window.location.href);
    url.hash = open ? section : '';
    history.replaceState(history.state, '', url.hash ? url : url.pathname + url.search);
  };

  const open = (trigger?: HTMLElement | null, section: Section = 'about') => {
    if (isOpen()) return;
    opener = trigger ?? (document.activeElement as HTMLElement | null);
    // Si se abrió desde el menú, al cerrar el foco vuelve al botón del menú
    if (opener?.closest('[data-dock-menu]')) opener = document.querySelector<HTMLElement>('[data-menu-toggle]');
    // Si se abre desde el menú, el menú se cierra primero
    if (body.dataset.menu === 'open') closeMenu();
    setAbout(true, section);
    // Contact: el panel entra ya desplazado hasta esa sección
    const target = section === 'contact' ? panel.querySelector<HTMLElement>('[data-about-contact]') : null;
    panel.scrollTop = target ? target.offsetTop : 0;
    panel.querySelector<HTMLElement>('[data-about-close]')?.focus({ preventScroll: true });
  };

  const close = () => {
    if (!isOpen()) return;
    setAbout(false);
    opener?.focus({ preventScroll: true });
  };

  document
    .querySelectorAll<HTMLElement>('[data-about-open], [data-menu-action="about"], [data-menu-action="contact"]')
    .forEach((el) =>
      el.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          open(el, el.dataset.menuAction === 'contact' ? 'contact' : 'about');
        },
        { signal },
      ),
    );

  document.querySelectorAll('[data-about-close]').forEach((el) => el.addEventListener('click', close, { signal }));

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && isOpen()) close();
    },
    { signal },
  );

  // Link directo: /portfolio/#about o /portfolio/#contact abren el panel al cargar
  if (window.location.hash === '#about') open();
  if (window.location.hash === '#contact') open(null, 'contact');
}

let controller: AbortController | undefined;

document.addEventListener('astro:page-load', () => {
  controller?.abort();
  controller = new AbortController();
  initDock(controller.signal);
  initDisplayMode(controller.signal);
  initLanguage(controller.signal);
  initAbout(controller.signal);
  initReveal();
  initCopyButtons();
  initReadingProgress(controller.signal);
  initToc(controller.signal);
});
