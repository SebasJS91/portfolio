import { html, render, Component } from '../vendor/preact-htm.js';
import { Prototipo } from './prototipo.js';
import { secciones, puntos } from './puntos.js';
import { encabezado, pie } from './contenido.js';

const ANCHO = 390;
const ALTO = 844;
const MARCO = 5;
// En el Figma del portafolio el teléfono ocupa ~80 % del alto del panel gris.
const PROPORCION_TELEFONO = 0.8;
// Alto reservado debajo del teléfono para los botones de escenario y reinicio
const ALTO_ACCIONES = 54;
const movil = window.matchMedia('(max-width: 899px)');

const escenarioInicial = { saldo: 250000, preaprobado: true, cupo: 950000, negocioNequi: true, creditoDemo: true };

// Bloque de texto: etiqueta, título que ya es la conclusión y líneas de apoyo.
const bloque = b => html`
  <section class="bloque">
    <p class="antetitulo">${b.etiqueta}</p>
    <h2>${b.titulo}</h2>
    <ul>${b.lineas.map(l => html`<li>${l}</li>`)}</ul>
  </section>`;

// Punto que corresponde a lo que muestra el teléfono: misma pantalla y misma capa.
// Un punto se activa en su `estado` y, si los define, en los estados de `activaEn`.
const coincide = (e, s) => e.screen === s.screen && (e.overlay || null) === (s.overlay || null);
const activaEn = (p, s) => [p.estado].concat(p.activaEn || []).some(e => coincide(e, s));
// Si el punto ya resaltado sigue coincidiendo (dos puntos pueden compartir pantalla), se mantiene.
function puntoActivo(s, actual) {
  if (actual >= 0 && activaEn(puntos[actual], s)) return actual;
  return puntos.findIndex(p => activaEn(p, s));
}

class Pagina extends Component {
  constructor() {
    super();
    this.state = { escenario: escenarioInicial, borrador: escenarioInicial, modal: false, activo: -1, escala: 1, altoApp: ALTO, esMovil: movil.matches };
    this.ajustar = this.ajustar.bind(this);
    this.teclas = this.teclas.bind(this);
  }
  componentDidMount() {
    this.ajustar();
    window.addEventListener('resize', this.ajustar);
    window.addEventListener('keydown', this.teclas);
  }
  componentDidUpdate(_, antes) {
    // Al abrir el modal, el foco va al primer campo; al cerrarlo, vuelve al botón que lo abrió
    if (this.state.modal && !antes.modal && this.modalRef) this.modalRef.querySelector('input').focus();
    if (!this.state.modal && antes.modal && this.botonEscenario) this.botonEscenario.focus();
  }
  teclas(e) {
    if (e.key === 'Escape' && this.state.modal) this.cerrarModal();
  }
  abrirModal() {
    this.setState({ modal: true, borrador: this.state.escenario });
  }
  cerrarModal() {
    this.setState({ modal: false });
  }
  aplicar() {
    this.setState({ escenario: this.state.borrador, modal: false });
  }
  ajustar() {
    const esMovil = movil.matches;
    if (esMovil) {
      const escala = document.documentElement.clientWidth / ANCHO;
      this.setState({ esMovil, escala, altoApp: Math.round(window.innerHeight / escala) });
    } else {
      const altoPanel = window.innerHeight - 16;
      const escala = Math.min(1, (altoPanel * PROPORCION_TELEFONO - ALTO_ACCIONES) / (ALTO + MARCO * 2));
      this.setState({ esMovil, escala, altoApp: ALTO });
    }
  }
  cambio(s) {
    // Tras un salto, el punto elegido manda (setState de Preact es asíncrono)
    const actual = this.elegido != null ? this.elegido : this.state.activo;
    this.elegido = null;
    const activo = puntoActivo(s, actual);
    if (activo !== this.state.activo) this.setState({ activo });
  }
  ir(i) {
    this.elegido = i;
    this.proto.saltar(puntos[i].estado);
    if (this.state.esMovil) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  setEsc(k, v) {
    this.setState({ borrador: Object.assign({}, this.state.borrador, { [k]: v }) });
  }
  render(_, { escenario, borrador, modal, activo, escala, altoApp, esMovil }) {
    const ancho = esMovil ? ANCHO : ANCHO + MARCO * 2;
    const alto = esMovil ? altoApp : ALTO + MARCO * 2;
    // Montos en pesos: se muestran con $ y puntos de miles, y se guardan como número
    const num = k => html`
      <input type="text" inputmode="numeric" value=${'$ ' + borrador[k].toLocaleString('es-CO')}
        onInput=${e => this.setEsc(k, parseInt(e.target.value.replace(/\D/g, '').slice(0, 9), 10) || 0)} />`;
    const si = k => html`
      <input type="checkbox" checked=${borrador[k]} onChange=${e => this.setEsc(k, e.target.checked)} />`;

    return html`
      <div class="pagina">
        <main class="contenido">
          <header class="encabezado">
            <p class="antetitulo">${encabezado.antetitulo}</p>
            <h1>${encabezado.titulo}</h1>
            <p class="intro">${encabezado.intro}</p>
            <p class="aviso">${encabezado.autoria}</p>
          </header>

          ${secciones.map(sec => html`
            ${bloque(sec)}
            <ol class="puntos">
              ${sec.puntos.map(p => {
                const i = puntos.indexOf(p);
                return html`
                <li class=${i === activo ? 'punto activo' : 'punto'}>
                  <button onClick=${() => this.ir(i)} aria-current=${i === activo ? 'step' : null}>
                    <span class="num">${String(i + 1).padStart(2, '0')}</span>
                    <span class="texto">
                      <span class="titulo">${p.titulo}</span>
                      <span class="pantalla">${p.pantalla}</span>
                      <span class="porque">${p.porque}</span>
                    </span>
                  </button>
                </li>`;
              })}
            </ol>`)}

          <footer>
            ${pie.map(p => html`<p>${p}</p>`)}
          </footer>
        </main>

        <section class="escenario-telefono" aria-label="Prototipo navegable">
          <div class="caja-telefono" style=${{ width: ancho * escala + 'px', height: alto * escala + 'px' }}>
            <div class=${esMovil ? 'telefono sin-marco' : 'telefono'}
              style=${{ transform: `scale(${escala})`, '--alto-app': altoApp + 'px' }}>
              <${Prototipo} ref=${r => { this.proto = r; }} onCambio=${s => this.cambio(s)} ...${escenario} />
            </div>
          </div>
          <div class="acciones-telefono">
            <button class="boton-contorno" ref=${r => { this.botonEscenario = r; }} onClick=${() => this.abrirModal()} aria-haspopup="dialog">Escenario del prototipo</button>
            <button class="boton-contorno" onClick=${() => this.proto.saltar({})}>Reiniciar prototipo</button>
          </div>
        </section>

        ${modal && html`
          <div class="fondo-modal" onClick=${e => { if (e.target === e.currentTarget) this.cerrarModal(); }}>
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-escenario" ref=${r => { this.modalRef = r; }}>
              <div class="modal-cabecera">
                <h2 id="titulo-escenario">Escenario del prototipo</h2>
                <button class="cerrar-modal" onClick=${() => this.cerrarModal()} aria-label="Cerrar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
                </button>
              </div>
              <p class="modal-intro">Cambia los datos con los que arranca el prototipo.</p>
              <div class="controles">
                <label>Disponible ${num('saldo')}</label>
                <label>Cupo preaprobado ${num('cupo')}</label>
                <label class="check">${si('preaprobado')} Tiene preaprobado</label>
                <label class="check">${si('negocioNequi')} Negocio Nequi (3 meses sin interés)</label>
                <label class="check">${si('creditoDemo')} Crédito de ejemplo ya tomado</label>
              </div>
              <div class="modal-acciones">
                <button class="boton-contorno" onClick=${() => this.cerrarModal()}>Cerrar</button>
                <button class="boton-lleno" onClick=${() => this.aplicar()}>Aplicar</button>
              </div>
            </div>
          </div>`}
      </div>
    `;
  }
}

render(html`<${Pagina} />`, document.getElementById('app'));
