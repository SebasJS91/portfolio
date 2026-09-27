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

function initReadingProgress() {
  const bar = document.querySelector<HTMLElement>('[data-reading-progress]');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  document.addEventListener('astro:before-swap', () => window.removeEventListener('scroll', update), {
    once: true,
  });
}

// Marca en <body data-zone="..."> la sección que ocupa el centro de la pantalla
// (hero / work / footer). El botón de menú y otros elementos reaccionan a esto.
let zoneObserver: IntersectionObserver | undefined;

function initZones() {
  zoneObserver?.disconnect();
  const zones = document.querySelectorAll<HTMLElement>('[data-zone]');
  if (!zones.length) return;
  document.body.dataset.zone = zones[0].dataset.zone;
  zoneObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          document.body.dataset.zone = (entry.target as HTMLElement).dataset.zone;
        }
      }
    },
    // Una línea horizontal en el centro del viewport
    { rootMargin: '-50% 0px -50% 0px' },
  );
  zones.forEach((zone) => zoneObserver?.observe(zone));
}

document.addEventListener('astro:page-load', () => {
  initZones();
  initReveal();
  initCopyButtons();
  initReadingProgress();
});
