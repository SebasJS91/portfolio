// Prototipo navegable de la propuesta de crédito en Nequi.
// Portado del lienzo de Claude (Prototipo.dc.html, 11 oct 2026). Este archivo es ahora la fuente de verdad.
import { html, Component } from '../vendor/preact-htm.js';

// Estado de arranque; la página lo usa para reiniciar y para saltar a un punto de la solución.
export function estadoInicial() {
  return { screen: 'login', overlay: null, pin: '', origin: 'inicio', form: 'paga', llave: '', amount: '', msg: '', showBal: false, tab: 'personal', result: 'ok', source: 'disponible', loanOpt: 'todo', otro: '', plazo: 24, accept: false, credit: null, extraDisp: 0, move: '', feed: [], movTab: 'hoy', movQuery: '', payOpt: 'minimo', payOtro: '', pagoFrom: 'inicio', detFrom: 'credito', llavesFrom: 'breb', nombre: '', toast: '' };
}

export class Prototipo extends Component {
  constructor(props) {
    super(props);
    this.state = estadoInicial();
  }
  runLoader(next) {
    var self = this;
    clearTimeout(this.loaderTimer);
    this.go('cargando');
    this.loaderTimer = setTimeout(function () { if (self.state.screen === 'cargando') { next(); } }, 3000);
  }
  showListo(next) {
    var self = this;
    clearTimeout(this.doneTimer);
    this.go('result', { result: 'ok' });
    this.doneTimer = setTimeout(function () { if (self.state.screen === 'result') { next(); } }, 1450);
  }
  // Aviso breve arriba de la pantalla; se oculta solo
  mostrarToast(texto) {
    var self = this;
    clearTimeout(this.toastTimer);
    this.setState({ toast: texto });
    this.toastTimer = setTimeout(function () { self.setState({ toast: '' }); }, 2600);
  }
  componentWillUnmount() {
    clearTimeout(this.loaderTimer);
    clearTimeout(this.doneTimer);
    clearTimeout(this.toastTimer);
  }
  // Lleva el prototipo a un estado limpio más los cambios del punto elegido.
  saltar(cambios) {
    clearTimeout(this.loaderTimer);
    clearTimeout(this.doneTimer);
    clearTimeout(this.toastTimer);
    this.setState(Object.assign(estadoInicial(), cambios || {}));
  }
  componentDidUpdate() {
    if (this.props.onCambio) this.props.onCambio(this.state);
  }
  go(screen, extra) {
    this.setState(Object.assign({ screen: screen, overlay: null }, extra || {}));
  }
  renderVals() {
    var self = this;
    var s = this.state;
    var saldo = (this.props.saldo != null ? this.props.saldo : 85000) + s.extraDisp;
    var money = function (n) { return '$ ' + Math.round(n).toLocaleString('es-CO'); };
    var amt = parseInt(String(s.amount).replace(/\D/g, ''), 10) || 0;
    var llave = s.form === 'paga' ? '@tiendadonaluz' : (s.llave.trim() || '@llave');
    var open = function (o) { return function () { self.setState({ overlay: o }); }; };
    var goto = function (scr, extra) { return function () { self.go(scr, extra); }; };
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(function (k) {
      return {
        label: k === 'del' ? '⌫' : k,
        aria: k === 'del' ? 'Borrar' : k,
        empty: k === '',
        real: k !== '',
        press: function () {
          if (k === 'del') { self.setState({ pin: self.state.pin.slice(0, -1) }); return; }
          var p = (self.state.pin + k).slice(0, 4);
          self.setState({ pin: p });
          if (p.length === 4) { setTimeout(function () { self.go('inicio', { pin: '' }); }, 250); }
        }
      };
    });
    var insuf = amt > saldo;
    // ---- Crédito (valores de ejemplo) ----
    var preap = this.props.preaprobado !== false;
    var cupo = this.props.cupo != null ? this.props.cupo : 950000;
    var negocioNequi = this.props.negocioNequi !== false;
    var hasCredito = preap && amt > 0;
    var credOk = cupo >= amt;
    var otroVal = parseInt(String(s.otro).replace(/\D/g, ''), 10) || 0;
    var otroValid = otroVal >= amt && otroVal <= cupo;
    var loanAmt = s.loanOpt === 'todo' ? cupo : (s.loanOpt === 'otro' && otroValid ? otroVal : amt);
    var TASA = 0.0378, TASA_ANT = 0.0422;
    var calc = function (n, P) {
      var sin = negocioNequi && n === 3;
      var i = sin ? 0 : TASA;
      var fianza = Math.round(P * 0.04);
      var cap = P + fianza;
      var seguro = Math.round(cap / 1000000 * 2000);
      var base = i === 0 ? cap / n : cap * i / (1 - Math.pow(1 + i, -n));
      return { sin: sin, fianza: fianza, cap: cap, seguro: seguro, cuota: Math.round(base + seguro) };
    };
    var pct = function (x) { return (x * 100).toFixed(2).replace('.', ',') + ' %'; };
    var ea = function (m) { return Math.pow(1 + m, 12) - 1; };
    var plan = calc(s.plazo, loanAmt);
    var rest = Math.max(loanAmt - amt, 0);
    var plazoTxt = function (n) { return n === 1 ? '1 mes' : n + ' meses'; };
    var fecha = new Date(); fecha.setMonth(fecha.getMonth() + 1);
    var ring = function (on) { return on ? '#DA0081' : '#8E8593'; };
    var border = function (on) { return on ? '1.5px solid #DA0081' : '1px solid #8E8593'; };
    var resetCred = { source: 'disponible', loanOpt: 'todo', otro: '', plazo: 24, accept: false };
    var loanOpts = [
      { id: 'todo', title: 'Sí, quiero todo', sub: money(cupo) + ' COP' },
      { id: 'necesito', title: 'Solo quiero lo que necesito', sub: money(amt) + ' COP' },
      { id: 'otro', title: 'Otro valor', sub: 'Define cuánto quieres' }
    ].map(function (o) {
      var on = s.loanOpt === o.id;
      return { title: o.title, sub: o.sub, sel: on, ring: ring(on), border: border(on), pick: function () { self.setState({ loanOpt: o.id }); } };
    });
    var plazos = [1, 3, 6, 12, 18, 24, 36].map(function (n) {
      var c = calc(n, loanAmt);
      var on = s.plazo === n;
      return { label: plazoTxt(n), cuota: money(c.cuota), sin: c.sin, sel: on, ring: ring(on), pick: function () { self.setState({ plazo: n, overlay: null }); } };
    });
    var canCred = !!s.loanOpt && (s.loanOpt !== 'otro' || otroValid);
    var desembolsoText = 'Pagamos ' + money(amt) + ' a ' + llave + ' con tu crédito.' +
      (rest > 0 ? '\nTe desembolsamos ' + money(rest) + ', que quedan guardados en Préstamos.' : '') +
      '\nRecuerda que pagar a tiempo te genera reportes positivos. Te enviamos al correo los documentos firmados electrónicamente.';
    // ---- Contenedor de crédito ----
    var demoPlan = calc(24, cupo);
    var demoCredit = { name: 'Preaprobado', balance: Math.max(cupo - 250000, 0), plan: demoPlan, plazo: 24, movs: [{ title: 'Tienda Doña Luz', sub: 'Pago', amount: 250000 }, { title: 'Desembolso crédito preaprobado', sub: 'Desembolso', amount: cupo, entra: true }],
      feed: [{ title: 'Tienda Doña Luz', sub: 'Pago', cred: true, amount: -250000 }, { title: 'Crédito Preaprobado', sub: 'Desembolso', cred: true, amount: cupo }] };
    var mkLoan = function (p) { return { debe: p.cap, cuota: p.cuota, i: p.sin ? 0 : TASA, seguro: p.seguro, paid: 0, history: [] }; };
    demoCredit.loan = mkLoan(demoPlan);
    var credit = s.credit === false ? null : (s.credit || (this.props.creditoDemo !== false ? demoCredit : null));
    // Con un crédito ya tomado no se ofrece el preaprobado de nuevo
    hasCredito = hasCredito && !credit;
    // ---- Pago del crédito ----
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var addMonths = function (n) { var d = new Date(); d.setMonth(d.getMonth() + n); return d; };
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var loan = credit ? credit.loan : null;
    var lPlazo = credit ? credit.plazo : 0;
    var interesMes = loan ? Math.round(loan.debe * loan.i) : 0;
    var totalPay = loan && loan.debe > 0 ? Math.round(loan.debe + interesMes + loan.seguro) : 0;
    var nRem = loan ? Math.max(lPlazo - loan.paid, 1) : 1;
    var altBase = !loan ? 0 : (loan.i === 0 ? loan.debe / (nRem + 12) : loan.debe * loan.i / (1 - Math.pow(1 + loan.i, -(nRem + 12))));
    var altCuota = loan ? Math.round(altBase + loan.seguro) : 0;
    var minPay = loan ? Math.min(loan.cuota, totalPay) : 0;
    var payOtroVal = parseInt(String(s.payOtro).replace(/\D/g, ''), 10) || 0;
    var payOtroOk = payOtroVal > 0 && payOtroVal <= totalPay;
    var payAmt = s.payOpt === 'alt' ? altCuota : s.payOpt === 'total' ? totalPay : s.payOpt === 'otro' ? payOtroVal : minPay;
    var payOpts = [
      { id: 'alt', title: 'Pago mínimo alternativo', amount: money(altCuota), note: true },
      { id: 'minimo', title: 'Pago mínimo', amount: money(minPay) },
      { id: 'total', title: 'Pago total de la deuda', amount: money(totalPay) },
      { id: 'otro', title: 'Otro valor', amount: '' }
    ].map(function (o) {
      var on = s.payOpt === o.id;
      return { title: o.title, amount: o.amount, hasAmount: !!o.amount, hasNote: !!o.note, sel: on, ring: ring(on), border: border(on), pick: function () { self.setState({ payOpt: o.id }); } };
    });
    var canPay = !!loan && loan.debe > 0 && payAmt > 0 && payAmt <= saldo && (s.payOpt !== 'otro' || payOtroOk);
    var hasContainer = !!credit && credit.container !== false;
    var cBal = hasContainer ? credit.balance : 0;
    var moveVal = parseInt(String(s.move).replace(/\D/g, ''), 10) || 0;
    var setMove = function (v) { self.setState({ move: String(Math.max(0, Math.min(v, cBal))) }); };
    var payee = s.form === 'paga' ? 'Tienda Doña Luz' : llave;
    var contSel = s.source === 'contenedor';
    var contOk = hasContainer && amt > 0 && amt <= cBal;
    // ---- Sección Movimientos ----
    var toRow = function (m) {
      var out = m.amount < 0;
      return { title: m.title, sub: m.sub, isCred: !!m.cred, isOut: out, isIn: !out, color: out ? '#C4006F' : '#12804A', amount: m.text || ((out ? '−' : '') + money(Math.abs(m.amount))) };
    };
    var hoyRaw = s.feed.concat(credit && credit.feed ? credit.feed : []);
    var ayerRaw = [{ title: 'Intereses', sub: 'Rendimientos', amount: 8, text: '$ 0,08' }, { title: 'Recarga celular', sub: 'Pago', amount: -20000 }];
    var q = s.movQuery.trim().toLowerCase();
    var keep = function (m) { return (s.movTab !== 'creditos' || m.cred) && (!q || m.title.toLowerCase().indexOf(q) >= 0); };
    var movGroups = s.movTab === 'hoy'
      ? [{ label: 'Hoy', showLabel: false, items: hoyRaw.map(toRow) }]
      : [{ label: 'Hoy', showLabel: true, items: hoyRaw.filter(keep).map(toRow) }, { label: 'Ayer', showLabel: true, items: ayerRaw.filter(keep).map(toRow) }].filter(function (g) { return g.items.length > 0; });
    var movTabs = [['hoy', 'Hoy'], ['mas', 'Más movimientos'], ['creditos', 'Créditos']].map(function (t) {
      var on = s.movTab === t[0];
      return { label: t[1], sel: on, bg: on ? '#DA0081' : '#fff', fg: on ? '#fff' : '#200020', border: on ? '1px solid #DA0081' : '1px solid #200020', pick: function () { self.setState({ movTab: t[0] }); } };
    });
    return {
      isMovs: s.screen === 'movs',
      showSearch: s.movTab !== 'hoy',
      movTabs: movTabs,
      movGroups: movGroups,
      movEmpty: movGroups.every(function (g) { return g.items.length === 0; }),
      movQuery: s.movQuery,
      onMovQuery: function (e) { self.setState({ movQuery: e.target.value }); },
      goMovs: goto('movs', { movTab: 'hoy', movQuery: '' }),
      isAsiPlata: s.screen === 'asiPlata',
      isCreditos: s.screen === 'creditos',
      isCredito: s.screen === 'credito',
      isCredDetalles: s.screen === 'credDetalles',
      ovMover: s.overlay === 'mover',
      totalPlata: money(saldo + cBal),
      hasCredit: hasContainer,
      noCredit: !hasContainer,
      hasContainer: hasContainer,
      noContainer: !!credit && !hasContainer,
      creditName: credit ? credit.name : '',
      creditBalanceText: money(cBal),
      creditCardLabel: 'Crédito ' + (credit ? credit.name : '') + ', ' + money(cBal),
      creditMovs: (credit ? credit.movs : []).map(function (m) {
        return { title: m.title, sub: m.sub, entra: !!m.entra, sale: !m.entra, color: m.entra ? '#12804A' : '#C4006F', amount: (m.entra ? '+' : '−') + money(m.amount) };
      }),
      cCuota: credit ? money(credit.plan.cuota) : '',
      cSin: !!(credit && credit.plan.sin),
      cConInteres: !(credit && credit.plan.sin),
      cCapital: credit ? money(credit.plan.cap) : '',
      cFianza: credit ? money(credit.plan.fianza) : '',
      cSeguro: credit ? money(credit.plan.seguro) : '',
      cPlazo: credit ? plazoTxt(credit.plazo) : '',
      moveDisplay: moveVal ? money(moveVal) : '',
      onMove: function (e) { self.setState({ move: e.target.value.replace(/\D/g, '').slice(0, 9) }); },
      moveMinus: function () { setMove(moveVal - 10000); },
      movePlus: function () { setMove(moveVal + 10000); },
      moveError: moveVal > cBal,
      canMove: moveVal > 0 && moveVal <= cBal,
      cantMove: !(moveVal > 0 && moveVal <= cBal),
      doMove: function () {
        var c = Object.assign({}, credit, { balance: cBal - moveVal, movs: [{ title: 'Moviste a Disponible', sub: 'Movimiento', amount: moveVal }].concat(credit.movs) });
        var f = [{ title: 'Desde Préstamos', sub: 'Moviste plata', cred: true, amount: moveVal }].concat(self.state.feed);
        self.setState({ credit: c, extraDisp: self.state.extraDisp + moveVal, move: '', overlay: null, feed: f });
      },
      goAsiPlata: goto('asiPlata'),
      goCreditos: goto('creditos'),
      goCredito: goto('credito'),
      goCredDetalles: goto('credDetalles', { detFrom: 'credito' }),
      goCredDetallesPago: goto('credDetalles', { detFrom: 'credPagos' }),
      backFromDetalles: function () { self.go(self.state.detFrom || 'credito'); },
      isCredPagos: s.screen === 'credPagos',
      isQuePagar: s.screen === 'quePagar',
      goCredPagos: function () {
        if (!credit) { self.go('creditos'); return; }
        var from = (s.screen === 'inicio' || s.screen === 'credito') ? s.screen : self.state.pagoFrom;
        self.go('credPagos', { pagoFrom: from });
      },
      backFromCredPagos: function () { self.go(self.state.pagoFrom || 'inicio'); },
      goQuePagar: goto('quePagar', { payOpt: 'minimo', payOtro: '' }),
      pCuota: loan ? money(loan.cuota) : '',
      pDebe: loan ? money(loan.debe) : '',
      pProgress: loan ? Math.round(loan.paid / Math.max(lPlazo, 1) * 100) + '%' : '0%',
      pPagadas: loan ? loan.paid + ' de ' + lPlazo : '',
      pActivo: !!loan && loan.debe > 0,
      pProximo: loan && loan.debe > 0 ? (function () { var d = addMonths(loan.paid + 1); return 'Próximo pago: ' + d.getDate() + ' de ' + MESES[d.getMonth()]; })() : '¡Pagaste todo tu crédito!',
      pHistory: loan ? loan.history : [],
      pNoHistory: !loan || loan.history.length === 0,
      payOpts: payOpts,
      payIsOtro: s.payOpt === 'otro',
      payOtroDisplay: payOtroVal ? money(payOtroVal) : '',
      onPayOtro: function (e) { self.setState({ payOtro: e.target.value.replace(/\D/g, '').slice(0, 9) }); },
      payTotalText: money(totalPay),
      payNoAlcanza: payAmt > saldo,
      canPay: canPay,
      cantPay: !canPay,
      doPay: function () {
        var l = Object.assign({}, loan);
        var plazoNuevo = lPlazo;
        var label = 'Pago de cuota';
        if (s.payOpt === 'total') {
          l.debe = 0; l.paid = plazoNuevo; label = 'Pago total';
        } else {
          var capital = Math.max(payAmt - l.seguro - interesMes, 0);
          l.debe = Math.max(l.debe - capital, 0);
          var meta = l.cuota;
          if (s.payOpt === 'alt') { plazoNuevo = lPlazo + 12; l.cuota = altCuota; meta = altCuota; label = 'Pago con plazo ampliado'; }
          if (payAmt >= meta - 1) { l.paid = l.paid + 1; if (payAmt > meta + 1) { label = 'Cuota y abono'; } }
          else { label = 'Abono'; }
          if (l.debe === 0) { l.paid = plazoNuevo; }
        }
        var hoy = new Date();
        l.history = [{ date: pad(hoy.getDate()) + '/' + pad(hoy.getMonth() + 1) + '/' + hoy.getFullYear(), label: label, amount: '−' + money(payAmt) }].concat(loan.history);
        var c = Object.assign({}, credit, { loan: l, plazo: plazoNuevo, plan: Object.assign({}, credit.plan, { cuota: l.cuota }) });
        var f = [{ title: 'Pago de tu crédito', sub: 'Pago', cred: true, amount: -payAmt }].concat(self.state.feed);
        self.setState({ credit: c, extraDisp: self.state.extraDisp - payAmt, feed: f });
        self.showListo(function () { self.go('credPagos'); });
      },
      ovNombre: s.overlay === 'nombre',
      nombreValue: s.nombre,
      onNombre: function (e) { self.setState({ nombre: e.target.value.slice(0, 24) }); },
      openNombre: function () { self.setState({ overlay: 'nombre', nombre: credit ? credit.name : '' }); },
      canNombre: s.nombre.trim().length > 0,
      cantNombre: s.nombre.trim().length === 0,
      saveNombre: function () {
        self.setState({ credit: Object.assign({}, credit, { name: self.state.nombre.trim() }), overlay: null, nombre: '' });
      },
      openMover: function () { self.setState({ overlay: 'mover', move: '' }); },
      toInicioPlain: goto('inicio'),
      isCredOpciones: s.screen === 'credOpciones',
      isCredResumen: s.screen === 'credResumen',
      isCredContrato: s.screen === 'credContrato',
      isCredValida: s.screen === 'credValida',
      isCredFacial: s.screen === 'credFacial',
      ovPlazo: s.overlay === 'plazo',
      ovDesembolso: s.overlay === 'desembolso',
      hasCredito: hasCredito,
      credOk: hasCredito && credOk,
      credLow: hasCredito && !credOk,
      dispSel: s.source === 'disponible',
      credSel: s.source === 'credito',
      dispRing: ring(s.source === 'disponible'),
      credRing: ring(s.source === 'credito'),
      dispBorder: border(s.source === 'disponible'),
      credBorder: border(s.source === 'credito'),
      srcDisp: s.source === 'disponible',
      srcCred: s.source === 'credito',
      srcCont: contSel,
      contOrigen: hasContainer && amt > 0,
      contOk: contOk,
      contLow: hasContainer && amt > 0 && !contOk,
      contSel: contSel,
      contRing: ring(contSel),
      contBorder: border(contSel),
      pickContenedor: function () { self.setState({ source: 'contenedor' }); },
      cupoText: money(cupo),
      amountText: money(amt),
      loanText: money(loanAmt),
      restText: money(rest),
      hasRest: rest > 0,
      loanOpts: loanOpts,
      isOtro: s.loanOpt === 'otro',
      otroDisplay: otroVal ? money(otroVal) : '',
      otroError: s.loanOpt === 'otro' && s.otro !== '' && !otroValid,
      plazos: plazos,
      plazoLabel: plazoTxt(s.plazo),
      cuotaText: money(plan.cuota),
      sinInteres: plan.sin,
      conInteres: !plan.sin,
      tasaOld: '4,22 % E.M. igual a ' + pct(ea(TASA_ANT)) + ' E.A.',
      tasaNew: '3,78 % E.M. igual a ' + pct(ea(TASA)) + ' E.A.',
      tasaEA: plan.sin ? '0 %' : pct(ea(TASA)),
      capitalText: money(plan.cap),
      fianzaText: money(plan.fianza),
      seguroText: money(plan.seguro),
      fechaPago: String(fecha.getDate()),
      canCred: canCred,
      cantCred: !canCred,
      accept: s.accept,
      notAccept: !s.accept,
      desembolsoText: desembolsoText,
      pickDisponible: function () { self.setState({ source: 'disponible' }); },
      pickCredito: function () { self.setState({ source: 'credito' }); },
      origenContinuar: function () {
        if (self.state.source === 'credito' && hasCredito && credOk) { self.go('credOpciones'); }
        else if (self.state.source === 'contenedor' && contOk) { self.setState({ overlay: 'confirm' }); }
        else { self.setState({ overlay: 'confirm', source: 'disponible' }); }
      },
      onOtro: function (e) { self.setState({ otro: e.target.value.replace(/\D/g, '').slice(0, 9) }); },
      openPlazo: open('plazo'),
      toOrigen: goto('origen'),
      toOpciones: goto('credOpciones'),
      toResumen: goto('credResumen'),
      toContrato: goto('credContrato'),
      toValida: goto('credValida'),
      toFacial: goto('credFacial'),
      toggleAccept: function () { self.setState({ accept: !self.state.accept }); },
      simulateFacial: function () {
        self.runLoader(function () {
          self.showListo(function () {
            self.go(self.state.form, { overlay: 'confirm' });
            self.mostrarToast('Ya tienes tu crédito disponible');
          });
        });
      },
      toast: s.toast,
      isLogin: s.screen === 'login',
      isClave: s.screen === 'clave',
      isInicio: s.screen === 'inicio',
      isScan: s.screen === 'scan',
      isBreb: s.screen === 'breb',
      isLlaves: s.screen === 'llaves',
      isPaga: s.screen === 'paga',
      isResult: s.screen === 'result',
      ovLoginFab: s.overlay === 'loginFab',
      ovLoginQr: s.overlay === 'loginQr',
      ovFab: s.overlay === 'fab',
      ovQr: s.overlay === 'qr',
      ovEnviar: s.overlay === 'enviar',
      ovBrebQr: s.overlay === 'brebQr',
      ovConfirm: s.overlay === 'confirm',
      resultOk: s.result === 'ok',
      resultInsuf: s.result === 'insuf',
      homeGap: s.result === 'ok' ? 'auto' : '12px',
      tabPersonal: s.tab === 'personal',
      tabNegocio: s.tab === 'negocio',
      pinBoxes: [0, 1, 2, 3].map(function (i) { return { filled: i < s.pin.length }; }),
      keys: keys,
      balance: s.showBal ? money(saldo) : '$ *****',
      eyeLabel: s.showBal ? 'Ocultar saldo' : 'Mostrar saldo',
      amountDisplay: amt ? money(amt) : '',
      llaveValue: s.llave,
      msgValue: s.msg,
      payLlave: llave,
      amountConfirm: money(amt) + ',00',
      maskedName: s.form === 'paga' ? 'Tie*** Doñ* Luz' : 'Nom***** Ape******',
      bank: s.form === 'paga' ? 'Neq**' : 'Ban********',
      canPaga: amt > 0,
      cantPaga: !(amt > 0),
      canLlaves: amt > 0 && s.llave.trim().length > 2,
      cantLlaves: !(amt > 0 && s.llave.trim().length > 2),
      okLine: 'Le enviaste ' + money(amt) + ' a ' + llave + '.',
      faltan: 'Te faltan ' + money(Math.max(amt - saldo, 0)) + ' para este pago. En tu Disponible tienes ' + money(saldo) + '.',
      onAmount: function (e) { self.setState({ amount: e.target.value.replace(/\D/g, '').slice(0, 9) }); },
      onLlave: function (e) { self.setState({ llave: e.target.value }); },
      onMsg: function (e) { self.setState({ msg: e.target.value }); },
      goClave: goto('clave', { pin: '' }),
      backLogin: goto('login'),
      logout: goto('login', { showBal: false }),
      openLoginFab: open('loginFab'),
      openLoginQr: open('loginQr'),
      openFab: open('fab'),
      openQr: open('qr'),
      openEnviar: open('enviar'),
      openBrebQr: open('brebQr'),
      closeOverlay: open(null),
      continuar: function () { self.runLoader(function () { self.go('origen'); }); },
      openConfirm: open('confirm'),
      backFromOrigen: goto(s.form),
      saldoText: money(saldo),
      isCargando: s.screen === 'cargando',
      isOrigen: s.screen === 'origen',
      scanFromLogin: goto('scan', { origin: 'login' }),
      scanFromInicio: goto('scan', { origin: 'inicio' }),
      scanFromBreb: goto('scan', { origin: 'breb' }),
      closeScan: function () { self.go(self.state.origin); },
      simulateScan: goto('paga', Object.assign({ form: 'paga', amount: '' }, resetCred)),
      backFromPaga: goto('scan'),
      goBreb: goto('breb'),
      goLlaves: goto('llaves', Object.assign({ form: 'llaves', amount: '', llave: '', msg: '', llavesFrom: 'breb' }, resetCred)),
      goLlavesEnvia: goto('llaves', Object.assign({ form: 'llaves', amount: '', llave: '', msg: '', llavesFrom: 'enviar' }, resetCred)),
      backFromLlaves: function () {
        if (self.state.llavesFrom === 'enviar') { self.go('inicio', { overlay: 'enviar' }); }
        else { self.go('breb'); }
      },
      toInicio: function () { self.go(self.state.origin === 'login' && s.screen !== 'result' ? 'login' : 'inicio'); },
      pickPersonal: function () { self.setState({ tab: 'personal' }); },
      pickNegocio: function () { self.setState({ tab: 'negocio' }); },
      toggleBal: function () { self.setState({ showBal: !self.state.showBal }); },
      enviar: function () {
        if (self.state.source === 'credito') {
          var nuevo = { name: 'Preaprobado', balance: rest, plan: plan, plazo: self.state.plazo, movs: [{ title: payee, sub: 'Pago', amount: amt }, { title: 'Desembolso crédito preaprobado', sub: 'Desembolso', amount: loanAmt, entra: true }],
            feed: [{ title: payee, sub: 'Pago', cred: true, amount: -amt }, { title: 'Crédito Preaprobado', sub: 'Desembolso', cred: true, amount: loanAmt }],
            loan: mkLoan(plan), container: rest > 0 };
          self.setState({ credit: nuevo });
          self.showListo(function () { self.go('inicio', { overlay: 'desembolso' }); });
        } else if (self.state.source === 'contenedor' && contOk) {
          var c = Object.assign({}, credit, { balance: cBal - amt, movs: [{ title: payee, sub: 'Pago', amount: amt }].concat(credit.movs) });
          var f = [{ title: payee, sub: 'Pago', cred: true, amount: -amt }].concat(self.state.feed);
          self.setState({ credit: c, feed: f });
          self.showListo(function () { self.go('inicio'); });
        } else if (insuf) {
          self.go('result', { result: 'insuf' });
        } else {
          self.setState({ feed: [{ title: payee, sub: 'Pago', cred: false, amount: -amt }].concat(self.state.feed) });
          self.showListo(function () { self.go('inicio'); });
        }
      },
      fixAmount: function () { self.go(self.state.form); }
    };
  }
  render() {
    const v = this.renderVals();
    return html`
      <div style="width:390px;height:var(--alto-app,844px);position:relative;overflow:hidden;font-family:'Manrope',sans-serif;color:#200020;background:#fff">
      
      <!-- ============ LOGIN ============ -->
      ${v.isLogin && html`
      <div style="position:absolute;inset:0;background:#200020;color:#fff;display:flex;flex-direction:column;padding:48px 16px 24px;box-sizing:border-box">
      <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.16);border-radius:6px;padding:6px 12px">
      <div style="width:20px;height:20px;border-radius:50%;border:3px solid #DA0081;border-right-color:#F3D6E8;box-sizing:border-box"></div>
      <div><div style="font-size:12px;color:#E9E2EC">Clave dinámica</div><div style="font-size:16px;font-weight:700;letter-spacing:3px">658918</div></div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left:24px"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"></path></svg>
      </div>
      <div style="display:flex;align-items:center;gap:8px;border:1px solid #fff;border-radius:4px;padding:8px 14px;font-size:16px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.7"></path><path d="M12 17h.01"></path></svg>Ayuda</div>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative">
      <div style="position:relative;font-size:76px;font-weight:800;letter-spacing:-3px;color:#ECE8F4;line-height:1">
      Nequi</div>
      <span style="position: absolute; left: 62px; top: 248px; width: 12px; height: 12px; background: #DA0081; border-radius: 2px"></span></div>
      <div style="display:flex;align-items:center;gap:14px;background:#4A3150;border-radius:4px;height:54px;padding:0 16px;margin-bottom:20px">
      <span style="color:#D9B3CF;font-size:15px">+57</span>
      <span style="width:2px;height:20px;background:#200020"></span>
      <span style="font-size:17px">300 123 4567</span>
      </div>
      <div style="display:flex;gap:10px">
      <button onClick=${v.goClave} style="flex:1;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:18px">Entra</button>
      <button onClick=${v.openLoginFab} aria-label="Pagos y QR sin entrar" style="width:52px;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;display:flex;align-items:center;justify-content:center">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"></path><path d="M17 7c-1-1.5-2.7-2-5-2-3 0-4.5 1.5-4.5 3.3 0 4.5 10 2.4 10 7.2 0 2-1.8 3.5-5 3.5-2.5 0-4.3-.8-5.5-2.3"></path></svg>
      </button>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:28px;font-size:16px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect></svg>¿Cambiaste tu cel?</div>
      </div>
      `}
      
      ${v.ovLoginFab && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.88)">
      <div style="position:absolute;right:16px;bottom:184px;display:flex;flex-direction:column;align-items:flex-end;gap:12px">
      <div style="display:flex;align-items:center;gap:16px;color:#fff;font-size:17px">Comprobar un pago
      <div style="width:40px;height:40px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"></path></svg></div></div>
      <button onClick=${v.openLoginQr} style="display:flex;align-items:center;gap:16px;color:#fff;font-size:17px;background:none;border:none;padding:0">Usar QR
      <span style="width:40px;height:40px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg></span></button>
      </div>
      <button onClick=${v.closeOverlay} aria-label="Cerrar" style="position:absolute;right:16px;bottom:76px;width:52px;height:52px;background:#DCD6DE;border:none;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#200020">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
      </div>
      `}
      
      ${v.ovLoginQr && html`
      <div style="position:absolute;inset:0;background:rgba(255,255,255,0.38)">
      <div style="position:absolute;left:0;right:0;bottom:0;background:#200020;color:#fff;border-radius:28px 28px 0 0;padding:14px 16px 36px">
      <div style="width:36px;height:4px;background:#fff;border-radius:2px;margin:0 auto"></div>
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#fff;padding:6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <button onClick=${v.scanFromLogin} style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;color:#fff;font-size:18px;padding:12px 0">Escanea QR<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"></path></svg></button>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:18px;padding:12px 0">Generar QR de mi negocio<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l2-6h14l2 6z"></path><path d="M4 10v10h16V10"></path><rect x="9" y="14" width="6" height="6"></rect></svg></div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:18px;padding:12px 0">Generar QR personal<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg></div>
      </div>
      </div>
      `}
      
      <!-- ============ CLAVE ============ -->
      ${v.isClave && html`
      <div style="position:absolute;inset:0;background:#200020;color:#fff;display:flex;flex-direction:column;padding:40px 16px 32px;box-sizing:border-box">
      <button onClick=${v.backLogin} aria-label="Volver" style="align-self:flex-start;background:none;border:none;color:#fff;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <h1 style="margin:28px 0 0;font-size:26px;font-weight:700">Escribe tu clave</h1>
      <div style="display:flex;justify-content:center;gap:20px;margin-top:40px">
      ${v.pinBoxes.map((b) => html`
      <div style="width:48px;height:48px;background:#ECE8F4;border-radius:4px;display:flex;align-items:center;justify-content:center">
      ${b.filled && html`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#DA0081" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M10 10L10.00 2.00M10 10L17.61 7.53M10 10L14.70 16.47M10 10L5.30 16.47M10 10L2.39 7.53"></path></svg>`}
      </div>
      `)}
      </div>
      <p style="margin:28px 0 0;text-align:center;font-size:15px;line-height:1.4">No dudamos que seas tú...<br />Pero es mejor confirmar ;)</p>
      <div style="margin-top:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));row-gap:4px">
      ${v.keys.map((k) => html`
      ${k.empty && html`<div></div>`}
      ${k.real && html`<button onClick=${k.press} aria-label=${k.aria} style="height:56px;background:none;border:none;color:#fff;font-size:32px;font-weight:400">${k.label}</button>`}
      `)}
      </div>
      <div style="align-self:center;margin-top:24px;border:1px solid #fff;border-radius:4px;padding:10px 32px;font-size:16px">Olvidé mi clave</div>
      </div>
      `}
      
      <!-- ============ INICIO ============ -->
      ${v.isInicio && html`
      <div style="position:absolute;inset:0;background:#fff">
      <div class="nq-noscroll" style="position:absolute;inset:0;overflow-y:auto;padding-bottom:110px;box-sizing:border-box">
      <div style="position:relative;height:330px">
      <svg width="390" height="330" viewBox="0 0 390 330" aria-hidden="true" style="position:absolute;inset:0"><polygon points="0,226 34,286 298,312 390,250 390,268 150,326 0,242" fill="#DA0081"></polygon><polygon points="0,0 390,0 390,250 298,312 34,286 0,226" fill="#200020"></polygon></svg>
      <div style="position:relative;padding:44px 16px 0;color:#fff">
      
      <div style="display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path></svg></div>
      <div style="flex:1"><div style="font-size:14px">Hola,</div><div style="font-size:18px;font-weight:500">Sebastian</div></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"></path><path d="M10 21h4"></path></svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="margin-left:12px"><path d="M8.5 8.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3v1"></path><path d="M12 19h.01"></path></svg>
      <button onClick=${v.logout} aria-label="Cerrar sesión" style="background:none;border:none;color:#fff;padding:4px;margin-left:6px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></button>
      </div><div style="display:flex;flex-direction:column;align-items:center;margin-top:24px">
      <div style="display:flex;align-items:center;gap:6px;font-size:16px">Depósito Bajo Monto
      <button onClick=${v.toggleBal} aria-label=${v.eyeLabel} style="background:none;border:none;color:#fff;padding:2px;display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div>
      <div style="font-size:30px;font-weight:700;margin-top:4px">${v.balance}</div>
      <div style="font-size:15px;margin-top:6px">Total ${v.balance}</div>
      <button onClick=${v.goAsiPlata} style="display:flex;align-items:center;gap:6px;background:none;color:#fff;border:1px solid #fff;border-radius:4px;padding:5px 16px;margin-top:14px;font-size:15px">Tu plata<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></button>
      </div>
      </div>
      </div>
      
      <div class="nq-noscroll" style="display:flex;gap:12px;padding:8px 16px 0;overflow-x:auto">
      <div style="flex:0 0 300px;height:136px;background:#E9E4EF;border:1px solid #DCD4E4;border-radius:10px;padding:16px;box-sizing:border-box;display:flex;justify-content:space-between">
      <div style="display:flex;flex-direction:column;gap:4px"><div style="font-size:15px;font-weight:700">Recarga tu cel</div><div style="font-size:14px;line-height:1.25;max-width:170px">Minutos e internet en tu cel, al instante</div><div style="margin-top:auto;align-self:flex-start;background:#200020;color:#fff;border-radius:4px;padding:6px 12px;font-size:14px">Recargar ahora</div></div>
      <div style="width:52px;height:96px;border:3px solid #5B2E86;border-radius:10px;background:#fff;align-self:center;display:flex;align-items:center;justify-content:center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2 11h11l2-7H7"></path><circle cx="9" cy="19" r="1.5"></circle><circle cx="17" cy="19" r="1.5"></circle></svg></div>
      </div>
      <div style="flex:0 0 300px;height:136px;background:#E9E4EF;border:1px solid #DCD4E4;border-radius:10px;padding:16px;box-sizing:border-box"><div style="font-size:15px;font-weight:700">Paga tus facturas</div><div style="font-size:14px">Servicios sin filas</div></div>
      </div>
      
      <div style="padding:22px 16px 0;font-size:15px;color:#4E4253">Sugeridos Nequi</div>
      <div class="nq-noscroll" style="display:flex;gap:8px;padding:10px 16px 0;overflow-x:auto">
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;text-align:center"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M10 10h5l-1 3h-3z" stroke="#DA0081"></path></svg></div>Paquetes de celular</div>
      <button onClick=${v.goBreb} style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;background:none;border:none;padding:0;color:#200020"><span style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;color:#3A0A5E;letter-spacing:-0.5px">Bre-B</span>Bre-B</button>
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;text-align:center"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"></path><path d="M9 8h6M9 12h6" stroke="#DA0081"></path></svg></div>Facturas</div>
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;text-align:center"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"></path></svg></div>Recargas</div>
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;text-align:center"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px"></div>Más</div>
      </div>
      
      <div style="display:flex;align-items:center;gap:10px;padding:24px 16px 0;font-size:16px;color:#4E4253">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"></path></svg>
      <span style="flex:1">Tus favoritos</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="16" height="16" rx="2"></rect><path d="M12 12l9-9"></path></svg>
      </div>
      <div style="display:flex;gap:8px;padding:12px 16px 0">
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center"><div style="width:44px;height:44px;background:#5AA2F5;border-radius:6px;color:#fff;font-weight:800;font-size:26px;display:flex;align-items:center;justify-content:center">N</div></div><span style="text-align: center">App Nequi<br />Negocios</span></div>
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M9 8v10" stroke="#DA0081"></path></svg></div>Tarjeta</div>
      <button onClick=${v.goCredPagos} style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;background:none;border:none;padding:0;color:#200020"><span style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center;box-sizing:border-box"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="3 2"></circle><path d="M8 14c1 1.5 2.3 2 4 2s3-.5 4-2" stroke="#200020"></path></svg></span><span>Créditos</span></button>
      <div style="flex:0 0 80px;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px"><div style="width:64px;height:64px;border:1px solid #E3DFE6;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"></path></svg></div><span style="text-align: center">Traer plata<br />del exterior</span></div>
      </div>
      </div>
      
      <div style="position:absolute;left:16px;bottom:20px;width:278px;height:58px;background:#fff;border-radius:8px;box-shadow:0 4px 18px rgba(32,0,32,0.14);display:flex;padding:4px;box-sizing:border-box;gap:2px">
      <div style="flex:1;background:#ECE8F4;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;font-weight:700"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v10H3z" fill="#200020"></path></svg>Inicio</div>
      <button onClick=${v.goMovs} style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;background:none;border:none;border-radius:6px;color:#200020;padding:0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h4"></path></svg>Movimientos</button>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"></rect><rect x="13" y="4" width="7" height="7" rx="1"></rect><rect x="4" y="13" width="7" height="7" rx="1"></rect><rect x="13" y="13" width="7" height="7" rx="1"></rect></svg>Servicios</div>
      </div>
      <button onClick=${v.openFab} aria-label="Pagos y transferencias" style="position:absolute;right:16px;bottom:20px;width:58px;height:58px;background:#DA0081;border:none;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18"></path><path d="M17 7c-1-1.5-2.7-2-5-2-3 0-4.5 1.5-4.5 3.3 0 4.5 10 2.4 10 7.2 0 2-1.8 3.5-5 3.5-2.5 0-4.3-.8-5.5-2.3"></path></svg></button>
      </div>
      `}
      
      ${v.ovFab && html`
      <div style="position:absolute;inset:0;background:rgba(255,255,255,0.92);z-index:20">
      <div style="position:absolute;right:16px;bottom:20px;display:flex;flex-direction:column;align-items:flex-end;gap:18px;font-size:17px">
      <div style="display:flex;align-items:center;gap:16px">+ Servicios<span style="width:42px;height:42px;background:#5AA2F5;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"></rect><rect x="13" y="4" width="7" height="7" rx="1"></rect><rect x="4" y="13" width="7" height="7" rx="1"></rect><rect x="13" y="13" width="7" height="7" rx="1"></rect></svg></span></div>
      <div style="display:flex;align-items:center;gap:16px">Saca<span style="width:42px;height:42px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16M6 14l6 6 6-6"></path></svg></span></div>
      <div style="display:flex;align-items:center;gap:16px">Pide<span style="width:42px;height:42px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></span></div>
      <button onClick=${v.openEnviar} style="display:flex;align-items:center;gap:16px;background:none;border:none;padding:0;font-size:17px;color:#200020">Envía<span style="width:42px;height:42px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"></path></svg></span></button>
      <button onClick=${v.openQr} style="display:flex;align-items:center;gap:16px;background:none;border:none;padding:0;font-size:17px;color:#200020">Código QR<span style="width:42px;height:42px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg></span></button>
      <div style="display:flex;align-items:center;gap:16px">Recarga Nequi<span style="width:42px;height:42px;background:#DA0081;border-radius:4px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4M6 10l6-6 6 6"></path></svg></span></div>
      <button onClick=${v.closeOverlay} aria-label="Cerrar" style="width:58px;height:58px;background:#ECE8F4;border:none;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-top:6px;color:#200020;box-shadow:0 4px 14px rgba(32,0,32,0.12)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
      </div>
      </div>
      `}
      

      ${v.ovEnviar && html`
      <div style="position:absolute;inset:0;background:rgba(255,255,255,0.96);z-index:20;display:flex;flex-direction:column;padding:44px 16px 28px;box-sizing:border-box">
      <button onClick=${v.closeOverlay} aria-label="Volver" style="align-self:flex-start;background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <h2 style="margin:14px 0 18px;font-size:26px;font-weight:700">Opciones para enviar</h2>
      <div style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"></circle><path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5z"></path><circle cx="16.5" cy="9" r="2.6"></circle><path d="M16 14.2c2.9.2 5 1.8 5 4.8h-3.5"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Nequi</span><span style="display:block;font-size:15px;color:#6E6573">A otro número de Nequi</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <div style="display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3L3 10.5l7.5 3L21 3z"></path><path d="M21 3l-7.5 18-3-7.5"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Bancolombia</span><span style="display:block;font-size:15px;color:#6E6573">Cuenta ahorro o corriente</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <button onClick=${v.goLlavesEnvia} style="display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px;text-align:left;color:#200020"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="15.5" cy="8.5" r="4.5"></circle><circle cx="16.5" cy="7.5" r="1"></circle><path d="M12.3 11.7L4 20l2.5 1M7 17l2 2"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Enviar con llaves de Bre-B</span><span style="display:block;font-size:15px;color:#6E6573">A otros bancos gratis y de una</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
      <div style="display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M4 8V6.5A1.5 1.5 0 0 1 5.5 5H16"></path><path d="M20 12h-4a1.5 1.5 0 0 0 0 3h4"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Otros bancos</span><span style="display:block;font-size:15px;color:#6E6573">Montos altos, puede tardar más</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      </div>
      <div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding:0 8px 14px;border-bottom:1px solid #E3DFE6;font-size:16px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"></circle><path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5z"></path><circle cx="16.5" cy="9" r="2.6"></circle><path d="M16 14.2c2.9.2 5 1.8 5 4.8h-3.5"></path></svg>Contactos frecuentes de Nequi</div>
      <p style="margin:14px 8px 0;font-size:14px;line-height:1.4">Aquí van a aparecer los contactos de Nequi a los que más les envíes.</p>
      </div>
      `}
      ${v.ovQr && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.5);z-index:20">
      <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:28px 28px 0 0;padding:14px 16px 32px">
      <div style="width:36px;height:4px;background:#6E6573;border-radius:2px;margin:0 auto"></div>
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#200020;padding:6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <h2 style="margin:4px 0 18px;font-size:26px;font-weight:700">Código QR</h2>
      <div style="display:flex;flex-direction:column;gap:10px">
      <button onClick=${v.scanFromInicio} style="display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px;text-align:left;color:#200020"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Escanea QR</span><span style="display:block;font-size:14px;color:#6E6573">Paga, usa o redime</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
      <div style="display:flex;align-items:center;gap:16px;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l2-6h14l2 6z"></path><path d="M4 10v10h16V10"></path><rect x="9" y="14" width="6" height="6"></rect></svg><span style="flex:1"><span style="display:block;font-size:17px">QR para tu Negocio</span><span style="display:block;font-size:14px;color:#6E6573">Para recibir plata de tu negocio en tu Nequi</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <div style="display:flex;align-items:center;gap:16px;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">QR personal</span><span style="display:block;font-size:14px;color:#6E6573">Para recibir tu plata personal en tu Nequi</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <div style="display:flex;align-items:center;gap:16px;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px 16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Comprueba un pago</span><span style="display:block;font-size:14px;color:#6E6573">Confirma los pagos recibidos</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      </div>
      </div>
      </div>
      `}
      
      <!-- ============ ESCANEA QR ============ -->
      ${v.isScan && html`
      <div style="position:absolute;inset:0;background:#4B2B66;color:#fff">
      <div style="position:relative;padding:44px 16px 0;text-align:center">
      <div style="font-size:18px;font-weight:700;line-height:44px">Escanea QR</div>
      <button onClick=${v.closeScan} aria-label="Cerrar cámara" style="position:absolute;right:16px;top:44px;width:44px;height:44px;border-radius:50%;background:#2B1240;border:1px solid #5E3F7A;color:#fff;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
      <div style="font-size:16px;margin-top:14px">Paga o cambia por plata</div>
      </div>
      <div style="position:absolute;left:37px;top:200px;width:316px;height:316px">
      <div style="position:absolute;left:0;top:0;width:80px;height:80px;border-top:3px solid #FF3B7F;border-left:3px solid #FF3B7F;border-top-left-radius:14px"></div>
      <div style="position:absolute;right:0;top:0;width:80px;height:80px;border-top:3px solid #FF3B7F;border-right:3px solid #FF3B7F;border-top-right-radius:14px"></div>
      <div style="position:absolute;left:0;bottom:0;width:80px;height:80px;border-bottom:3px solid #FF3B7F;border-left:3px solid #FF3B7F;border-bottom-left-radius:14px"></div>
      <div style="position:absolute;right:0;bottom:0;width:80px;height:80px;border-bottom:3px solid #FF3B7F;border-right:3px solid #FF3B7F;border-bottom-right-radius:14px"></div>
      <button onClick=${v.simulateScan} style="position:absolute;inset:20px;background:#C9C7CC;border:none;border-radius:12px;color:#2B1240;font-size:15px;font-weight:600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg>Toca para simular el escaneo</button>
      </div>
      <div style="position:absolute;left:0;right:0;bottom:40px;display:flex;justify-content:space-around;padding:0 40px;font-size:14px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="width:44px;height:44px;border-radius:50%;background:#2B1240;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M7 6v12M10 6v12M13 6v12M16 6v12M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3"></path></svg></span>Código</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="width:44px;height:44px;border-radius:50%;background:#2B1240;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M14 3l7 7-3 3-7-7z"></path><path d="M11 6L4 17l3 3 11-7"></path></svg></span>Linterna</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="width:44px;height:44px;border-radius:50%;background:#2B1240;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 17l-5-5-9 8"></path></svg></span>Imagen</div>
      </div>
      </div>
      `}
      
      <!-- ============ BRE-B ============ -->
      ${v.isBreb && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 28px;box-sizing:border-box">
      <div style="position:relative;height:48px;display:flex;align-items:center;justify-content:center">
      <button onClick=${v.toInicio} aria-label="Volver" style="position:absolute;left:0;background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <div style="font-size:30px;font-weight:800;color:#3A0A5E;letter-spacing:-1px">Bre-B</div>
      </div>
      <div style="font-size:17px;font-weight:700;margin-top:16px">Envía plata al instante</div>
      <div style="display:flex;gap:8px;margin-top:12px;overflow:hidden;margin-right:-16px">
      <button onClick=${v.goLlaves} style="flex:0 0 138px;height:56px;display:flex;align-items:center;gap:10px;padding:0 12px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;color:#200020;font-size:15px;text-align:left;line-height:1.15"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="15" r="4"></circle><path d="M11 12l9-9M17 6l3 3M15 8l2 2"></path></svg>Envía con llaves</button>
      <button onClick=${v.openBrebQr} style="flex:0 0 138px;height:56px;display:flex;align-items:center;gap:10px;padding:0 12px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;color:#200020;font-size:15px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg>Código QR</button>
      <div style="flex:0 0 138px;height:56px;display:flex;align-items:center;gap:10px;padding:0 12px;border:1px solid #E3DFE6;border-radius:4px;font-size:15px;line-height:1.15;box-sizing:border-box"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h4"></path></svg>Tus movimientos</div>
      </div>
      <div style="font-size:17px;font-weight:700;margin-top:24px">Administra tus llaves</div>
      <div style="display:flex;background:#EEEDEF;border-radius:6px;padding:4px;margin-top:12px;gap:4px">
      ${v.tabPersonal && html`
      <button style="flex:1;height:40px;background:#fff;border:none;border-radius:4px;color:#DA0081;font-size:16px;font-weight:700">Personales</button>
      <button onClick=${v.pickNegocio} style="flex:1;height:40px;background:none;border:none;border-radius:4px;color:#4E2C55;font-size:16px;font-weight:600">Negocio</button>
      `}
      ${v.tabNegocio && html`
      <button onClick=${v.pickPersonal} style="flex:1;height:40px;background:none;border:none;border-radius:4px;color:#4E2C55;font-size:16px;font-weight:600">Personales</button>
      <button style="flex:1;height:40px;background:#fff;border:none;border-radius:4px;color:#DA0081;font-size:16px;font-weight:700">Negocio</button>
      `}
      </div>
      ${v.tabPersonal && html`
      <div style="display:flex;align-items:center;padding:16px 0;border-bottom:1px solid #E3DFE6">
      <div style="flex:1">
      <div style="display:inline-flex;align-items:center;gap:6px;background:#EEEDEF;border-radius:12px;padding:3px 10px;font-size:13px"><span style="width:8px;height:8px;border-radius:50%;background:#1FB15A"></span>Activa</div>
      <div style="font-size:17px;margin-top:8px">@3001234567</div>
      <div style="font-size:15px">Usuario sugerido Nequi</div>
      <div style="font-size:13px;color:#6E6573;margin-top:4px">Registrada 10/10/2025</div>
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"></path></svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#200020" aria-hidden="true" style="margin-left:14px"><circle cx="12" cy="5" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="12" cy="19" r="1.6"></circle></svg>
      </div>
      `}
      ${v.tabNegocio && html`
      <p style="margin:20px 0 0;font-size:15px;color:#6E6573">Aún no tienes llaves de negocio registradas.</p>
      `}
      <div style="margin-top:auto;height:52px;background:#DA0081;color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:17px">Registrar llaves</div>
      </div>
      `}
      
      ${v.ovBrebQr && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.5)">
      <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:28px 28px 0 0;padding:14px 16px 32px">
      <div style="width:36px;height:4px;background:#6E6573;border-radius:2px;margin:0 auto"></div>
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#200020;padding:6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <h2 style="margin:4px 0 18px;font-size:26px;font-weight:700">¿Qué quieres hacer?</h2>
      <div style="display:flex;flex-direction:column;gap:10px">
      <button onClick=${v.scanFromBreb} style="display:flex;align-items:center;gap:16px;background:#fff;border:2px solid #E3DFE6;border-radius:6px;padding:16px;text-align:left;color:#200020"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Enviar con QR</span><span style="display:block;font-size:15px;color:#6E6573">Escanea y paga al instante</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
      <div style="display:flex;align-items:center;gap:16px;border:2px solid #E3DFE6;border-radius:6px;padding:16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l2-6h14l2 6z"></path><path d="M4 10v10h16V10"></path><rect x="9" y="14" width="6" height="6"></rect></svg><span style="flex:1"><span style="display:block;font-size:17px">QR para tu Negocio</span><span style="display:block;font-size:15px;color:#6E6573">Para recibir plata de tu negocio en tu Nequi</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <div style="display:flex;align-items:center;gap:16px;border:2px solid #E3DFE6;border-radius:6px;padding:16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">QR personal</span><span style="display:block;font-size:15px;color:#6E6573">Para recibir tu plata personal en tu Nequi</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      </div>
      </div>
      </div>
      `}
      
      <!-- ============ ENVÍA CON LLAVES ============ -->
      ${v.isLlaves && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="position:relative;height:48px;display:flex;align-items:center;justify-content:center">
      <button onClick=${v.backFromLlaves} aria-label="Volver" style="position:absolute;left:0;background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <div style="font-size:30px;font-weight:800;color:#3A0A5E;letter-spacing:-1px">Bre-B</div>
      </div>
      <h1 style="margin:20px 0 0;font-size:26px;font-weight:700;line-height:1.2">¿A quién le vas a enviar plata?</h1>
      <p style="margin:14px 0 0;font-size:16px;font-weight:700;line-height:1.4">Con llaves de Bre-B, tu plata llega inmediatamente.</p>
      <label style="display:flex;align-items:center;background:#FBF5F9;border-radius:4px;height:58px;padding:0 18px;margin-top:16px"><input value=${v.llaveValue} onInput=${v.onLlave} placeholder="Escribe la llave para enviar" aria-label="Llave" style="flex:1;background:none;border:none;outline:none;font-size:16px;color:#200020" /><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="14" cy="8" r="4"></circle><path d="M6 21c0-4 4-6 8-6s8 2 8 6M4 6v6M1 9h6"></path></svg></label>
      <div style="font-size:12px;color:#6E6573;margin-top:6px;line-height:1.4">Escribe la llave donde enviarás: celular, correo, documento o usuario alfanumérico.</div>
      <input value=${v.amountDisplay} onInput=${v.onAmount} inputmode="numeric" placeholder="¿Cuánto?" aria-label="¿Cuánto?" style="background:#FBF5F9;border:none;border-radius:4px;height:58px;padding:0 18px;margin-top:12px;font-size:16px;outline:none;color:#200020" />
      <input value=${v.msgValue} onInput=${v.onMsg} placeholder="Mensaje" aria-label="Mensaje" style="background:#FBF5F9;border:none;border-radius:4px;height:58px;padding:0 18px;margin-top:12px;font-size:16px;outline:none;color:#200020" />
      <div style="margin-top:auto"></div>
      ${v.canLlaves && html`<button onClick=${v.continuar} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Continuar</button>`}
      ${v.cantLlaves && html`<button disabled=${true} style="width:100%;height:52px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;cursor:default">Continuar</button>`}
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      <!-- ============ PAGA (tras escanear) ============ -->
      ${v.isPaga && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="position:relative;height:48px;display:flex;align-items:center;justify-content:center">
      <button onClick=${v.backFromPaga} aria-label="Volver" style="position:absolute;left:0;background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <div style="font-size:30px;font-weight:800;color:#3A0A5E;letter-spacing:-1px">Bre-B</div>
      </div>
      <h1 style="margin:20px 0 0;font-size:30px;font-weight:700">Paga</h1>
      <div style="background:#FBF5F9;border-radius:4px;padding:12px 18px;margin-top:18px"><div style="font-size:14px;color:#6E6573">Vas a enviar a la llave</div><div style="font-size:17px;color:#5E5563;margin-top:4px">${v.payLlave}</div></div>
      <input value=${v.amountDisplay} onInput=${v.onAmount} inputmode="numeric" placeholder="¿Cuánto?" aria-label="¿Cuánto?" style="background:#FBF5F9;border:none;border-radius:4px;height:58px;padding:0 18px;margin-top:8px;font-size:17px;outline:none;color:#200020" />
      <div style="margin-top:auto"></div>
      ${v.canPaga && html`<button onClick=${v.continuar} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Continuar</button>`}
      ${v.cantPaga && html`<button disabled=${true} style="width:100%;height:52px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;cursor:default">Continuar</button>`}
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      <!-- ============ CARGANDO (3 s) ============ -->
      ${v.isCargando && html`
      <div role="status" aria-label="Cargando" style="position:absolute;inset:0;background:#fff;display:flex;align-items:center;justify-content:center">
      <div style="position:relative;width:64px;height:64px;animation:nqturn 1.6s ease-in-out infinite">
      <div style="position:absolute;left:21px;top:21px;width:22px;height:22px;border-radius:4px;background:rgba(218,0,129,0.82);animation:nqjoinA 1.6s ease-in-out infinite"></div>
      <div style="position:absolute;left:21px;top:21px;width:22px;height:22px;border-radius:4px;background:rgba(218,0,129,0.82);animation:nqjoinB 1.6s ease-in-out infinite"></div>
      </div>
      </div>
      `}
      
      <!-- ============ ORIGEN DE LA PLATA ============ -->
      ${v.isOrigen && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="position:relative;height:48px;display:flex;align-items:center;justify-content:center">
      <button onClick=${v.backFromOrigen} aria-label="Volver" style="position:absolute;left:0;background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <div style="font-size:30px;font-weight:800;color:#3A0A5E;letter-spacing:-1px">Bre-B</div>
      </div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:0 16px 16px">
      <h1 style="margin:20px 0 0;font-size:26px;font-weight:700;line-height:1.2">¿De dónde saldrá la plata?</h1>
      <div style="background:#FBF5F9;border-radius:4px;padding:12px 18px;margin-top:18px;display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:14px;color:#6E6573">Vas a pagar a</div><div style="font-size:17px;margin-top:2px">${v.payLlave}</div></div>
      <div style="font-size:20px;font-weight:700">${v.amountDisplay}</div>
      </div>
      <button onClick=${v.pickDisponible} aria-pressed=${v.dispSel} style="width:100%;display:flex;align-items:center;gap:12px;background:#fff;border:${v.dispBorder};border-radius:4px;padding:5px 14px 5px 5px;margin-top:16px;text-align:left;color:#200020">
      <span style="position:relative;width:44px;height:44px;background:#DA0081;border-radius:4px;flex:0 0 44px"><span style="position:absolute;left:4px;top:4px;width:16px;height:16px;background:#EC7FBC"></span><span style="position:absolute;left:23px;top:12px;width:8px;height:8px;background:#F9DCEC"></span><span style="position:absolute;left:8px;top:24px;width:8px;height:8px;background:#F9DCEC"></span><span style="position:absolute;left:22px;top:23px;width:17px;height:17px;background:#EC7FBC"></span></span>
      <span style="flex:1"><span style="display:block;font-size:17px">Disponible</span><span style="display:block;font-size:14px;color:#6E6573">Tienes ${v.saldoText}</span></span>
      <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${v.dispRing};box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 22px">${v.dispSel && html`<span style="width:10px;height:10px;border-radius:50%;background:#DA0081"></span>`}</span>
      </button>
      ${v.contOk && html`
      <button onClick=${v.pickContenedor} aria-pressed=${v.contSel} style="width:100%;display:flex;align-items:center;gap:12px;background:#fff;border:${v.contBorder};border-radius:4px;padding:5px 14px 5px 5px;margin-top:8px;text-align:left;color:#200020">
      <span style="position:relative;width:44px;height:44px;background:#DA0081;border-radius:4px;flex:0 0 44px;overflow:hidden"><span style="position:absolute;left:3px;top:0;width:16px;height:12px;border-radius:0 0 2px 2px;background:#E569B1"></span><span style="position:absolute;left:23px;top:3px;width:10px;height:10px;border-radius:2px;background:#E569B1"></span><span style="position:absolute;left:10px;top:18px;width:10px;height:14px;border-radius:2px;background:#E569B1"></span><span style="position:absolute;left:23px;top:17px;width:18px;height:15px;border-radius:2px;background:#E569B1"></span></span>
      <span style="flex:1;min-width:0"><span style="display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.creditName}</span><span style="display:flex;align-items:center;gap:6px;font-size:14px;color:#6E6573">Tienes ${v.creditBalanceText}<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:600;border-radius:10px;padding:1px 8px">crédito</span></span></span>
      <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${v.contRing};box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 22px">${v.contSel && html`<span style="width:10px;height:10px;border-radius:50%;background:#DA0081"></span>`}</span>
      </button>
      `}
      ${v.contLow && html`
      <div style="display:flex;align-items:center;gap:12px;border:1px dashed #8E8593;border-radius:4px;padding:5px 14px 5px 5px;margin-top:8px;color:#5E5563;opacity:0.85">
      <span style="position:relative;width:44px;height:44px;background:#DA0081;border-radius:4px;flex:0 0 44px;overflow:hidden"><span style="position:absolute;left:3px;top:0;width:16px;height:12px;border-radius:0 0 2px 2px;background:#E569B1"></span><span style="position:absolute;left:23px;top:3px;width:10px;height:10px;border-radius:2px;background:#E569B1"></span><span style="position:absolute;left:10px;top:18px;width:10px;height:14px;border-radius:2px;background:#E569B1"></span><span style="position:absolute;left:23px;top:17px;width:18px;height:15px;border-radius:2px;background:#E569B1"></span></span>
      <span style="flex:1;min-width:0"><span style="display:flex;align-items:center;gap:6px;font-size:17px;color:#200020">${v.creditName}<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:600;border-radius:10px;padding:1px 8px">crédito</span></span><span style="display:block;font-size:14px;line-height:1.35">Este pago supera lo que tienes: ${v.creditBalanceText}.</span></span>
      </div>
      `}
      ${v.hasCredito && html`
      <h2 style="margin:28px 0 0;font-size:22px;font-weight:800;line-height:1.25">¡Buenas noticias, tienes un préstamo disponible!</h2>
      <p style="margin:10px 0 0;font-size:16px;line-height:1.4">Tú decides cuánto usar. Pagamos por ti en segundos y lo que sobre queda guardado en Préstamos.</p>
      ${v.credOk && html`
      <button onClick=${v.pickCredito} aria-pressed=${v.credSel} style="width:100%;display:flex;align-items:center;gap:12px;background:#fff;border:${v.credBorder};border-radius:4px;padding:5px 14px 5px 5px;margin-top:16px;text-align:left;color:#200020">
      <span style="position:relative;width:44px;height:44px;background:#5B2A8C;border-radius:4px;flex:0 0 44px"><span style="position:absolute;left:4px;top:4px;width:16px;height:16px;background:#B9A6D6"></span><span style="position:absolute;left:23px;top:12px;width:8px;height:8px;background:#E6DDF2"></span><span style="position:absolute;left:8px;top:24px;width:8px;height:8px;background:#E6DDF2"></span><span style="position:absolute;left:22px;top:23px;width:17px;height:17px;background:#B9A6D6"></span></span>
      <span style="flex:1"><span style="display:block;font-size:17px">Crédito preaprobado</span><span style="display:block;font-size:14px;color:#6E6573">${v.cupoText} COP</span></span>
      <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${v.credRing};box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 22px">${v.credSel && html`<span style="width:10px;height:10px;border-radius:50%;background:#DA0081"></span>`}</span>
      </button>
      `}
      ${v.credLow && html`
      <div style="display:flex;align-items:center;gap:12px;border:1px dashed #8E8593;border-radius:4px;padding:5px 14px 5px 5px;margin-top:16px;color:#5E5563">
      <span style="position:relative;width:44px;height:44px;background:#B9A6D6;border-radius:4px;flex:0 0 44px"></span>
      <span style="flex:1;font-size:14px;line-height:1.35">Este pago supera tu crédito preaprobado de ${v.cupoText}.</span>
      </div>
      `}
      `}
      </div>
      <button onClick=${v.origenContinuar} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Continuar</button>
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      <!-- ============ CRÉDITO · MONTO Y PLAZO ============ -->
      ${v.isCredOpciones && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.toOrigen} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:0 16px 16px">
      <h1 style="margin:12px 0 0;font-size:26px;font-weight:700;line-height:1.2">Tienes un preaprobado por <span style="display:block;white-space:nowrap">${v.cupoText}</span></h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.4">Puedes pagar a ${v.payLlave} usando este monto. Elige la opción que más te convenga.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px">
      ${v.loanOpts.map((o) => html`
      <button onClick=${o.pick} aria-pressed=${o.sel} style="width:100%;display:flex;align-items:center;gap:12px;background:#fff;border:${o.border};border-radius:4px;padding:12px 14px;text-align:left;color:#200020">
      <span style="flex:1"><span style="display:block;font-size:17px">${o.title}</span><span style="display:block;font-size:14px;color:#6E6573">${o.sub}</span></span>
      <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${o.ring};box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 22px">${o.sel && html`<span style="width:10px;height:10px;border-radius:50%;background:#DA0081"></span>`}</span>
      </button>
      `)}
      </div>
      ${v.isOtro && html`
      <div style="font-size:14px;color:#6E6573;margin-top:10px;text-align:center">Puede ser desde ${v.amountText} hasta ${v.cupoText}</div>
      <input value=${v.otroDisplay} onInput=${v.onOtro} inputmode="numeric" placeholder="¿Cuánto?" aria-label="¿Cuánto quieres usar?" style="width:100%;box-sizing:border-box;background:#FBF5F9;border:none;border-radius:4px;height:58px;padding:0 18px;margin-top:8px;font-size:17px;outline:none;color:#200020" />
      ${v.otroError && html`<div style="font-size:13px;color:#C4006F;margin-top:6px">El valor debe estar entre ${v.amountText} y ${v.cupoText}.</div>`}
      `}
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:22px;font-size:15px">¿En cuánto tiempo la puedes pagar?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg></div>
      <button onClick=${v.openPlazo} style="width:100%;display:flex;align-items:center;justify-content:space-between;background:#FBF5F9;border:none;border-radius:4px;height:56px;padding:0 18px;margin-top:10px;font-size:17px;color:#200020">${v.plazoLabel}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
      <div style="border:1px solid #E3DFE6;border-radius:8px;padding:16px;margin-top:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px">Cuota mensual aproximada<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:4px"><span style="font-size:28px;font-weight:800;color:#C4006F">${v.cuotaText}</span>${v.sinInteres && html`<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:700;border-radius:12px;padding:3px 10px">Sin interés</span>`}</div>
      <div style="height:1px;background:#EEEAF0;margin:14px 0"></div>
      <div style="display:flex;gap:12px">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 24px"><circle cx="12" cy="9" r="6"></circle><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"></path></svg>
      <div style="font-size:15px;line-height:1.4"><div style="font-size:13px;color:#6E6573">Tasa de interés fija</div>
      ${v.conInteres && html`<div style="text-decoration:line-through;color:#6E6573">${v.tasaOld}</div><div>${v.tasaNew}</div>`}
      ${v.sinInteres && html`<div>0 % durante ${v.plazoLabel}. Este negocio Nequi te da meses sin interés.</div>`}
      </div>
      </div>
      </div>
      </div>
      ${v.canCred && html`<button onClick=${v.toResumen} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Continuar</button>`}
      ${v.cantCred && html`<button disabled=${true} style="width:100%;height:52px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;cursor:default">Continuar</button>`}
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      ${v.ovPlazo && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.5)">
      <div style="position:absolute;left:0;right:0;bottom:0;max-height:640px;display:flex;flex-direction:column;background:#fff;border-radius:28px 28px 0 0;padding:14px 16px 24px;box-sizing:border-box">
      <div style="width:36px;height:4px;background:#6E6573;border-radius:2px;margin:0 auto"></div>
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#200020;padding:6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <h2 style="margin:0 0 4px;font-size:22px;font-weight:700">¿En cuánto tiempo la puedes pagar?</h2>
      <div style="font-size:14px;color:#6E6573">Cuota mensual aproximada para ${v.loanText}</div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin-top:10px">
      ${v.plazos.map((p) => html`
      <button onClick=${p.pick} aria-pressed=${p.sel} style="width:100%;display:flex;align-items:center;gap:12px;background:none;border:none;border-bottom:1px solid #EEEAF0;padding:14px 2px;text-align:left;color:#200020">
      <span style="flex:1;display:flex;align-items:center;gap:8px;font-size:17px">${p.label}${p.sin && html`<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:700;border-radius:12px;padding:3px 10px">Sin interés</span>`}</span>
      <span style="font-size:15px;color:#5E5563">${p.cuota} al mes</span>
      <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${p.ring};box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 22px">${p.sel && html`<span style="width:10px;height:10px;border-radius:50%;background:#DA0081"></span>`}</span>
      </button>
      `)}
      </div>
      </div>
      </div>
      `}
      
      <!-- ============ CRÉDITO · ASÍ QUEDARÁ ============ -->
      ${v.isCredResumen && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.toOpciones} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:0 16px 16px">
      <h1 style="margin:12px 0 0;font-size:26px;font-weight:700">Así quedará tu crédito</h1>
      <div style="border:1.5px solid #DA0081;border-radius:8px;padding:16px 18px;margin-top:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:15px">Cuota mensual<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:4px"><span style="font-size:28px;font-weight:800;color:#C4006F">${v.cuotaText}</span>${v.sinInteres && html`<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:700;border-radius:12px;padding:3px 10px">Sin interés</span>`}</div>
      <div style="font-size:13px;color:#6E6573">Incluye capital, seguro e intereses</div>
      <div style="height:1px;background:#EEEAF0;margin:14px 0"></div>
      <div style="display:flex;align-items:center;gap:12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2"></path></svg><div><div style="font-size:13px;color:#6E6573">Tu fecha de pago</div><div style="font-size:16px">${v.fechaPago} de cada mes</div></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;margin-top:22px">
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"></path></svg><div><div style="font-size:13px;color:#6E6573">Pago a ${v.payLlave}</div><div style="font-size:16px">${v.amountText}</div></div></div>
      ${v.hasRest && html`<div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M3 7l12-4v4M16 14h2"></path></svg><div><div style="font-size:13px;color:#6E6573">Queda guardado en Préstamos</div><div style="font-size:16px">${v.restText}</div></div></div>`}
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle></svg><div><div style="font-size:13px;color:#6E6573">Capital + fianza</div><div style="font-size:16px">${v.capitalText}</div></div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"></rect><path d="M14.5 9c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.4.7-2.4 1.7 0 2.4 5 1.2 5 3.7 0 1-1 1.8-2.6 1.8-1.2 0-2.1-.4-2.7-1.2M12 6.5v1.3M12 16.2v1.3"></path></svg><div><div style="font-size:13px;color:#6E6573">Fianza (4 %)</div><div style="font-size:16px">${v.fianzaText}</div></div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path></svg><div><div style="font-size:13px;color:#6E6573">Tu seguro mensual</div><div style="font-size:16px">${v.seguroText}</div></div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"></path></svg><div style="font-size:15px;line-height:1.4"><div style="font-size:13px;color:#6E6573">Tasa de interés fija</div>${v.conInteres && html`<div style="text-decoration:line-through;color:#6E6573">${v.tasaOld}</div><div>${v.tasaNew}</div>`}${v.sinInteres && html`<div>0 % · sin interés</div>`}</div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg><div><div style="font-size:13px;color:#6E6573">Plazo</div><div style="font-size:16px">${v.plazoLabel}</div></div></div>
      </div>
      <div style="background:#E6FAFD;border-radius:8px;padding:16px 18px;margin-top:22px">
      <div style="font-size:17px;font-weight:600;color:#136F7A">Pagos automáticos</div>
      <div style="font-size:14px;line-height:1.45;margin-top:6px">Deja tu plata en tu Nequi y nosotros haremos el pago automáticamente en la fecha de pago de tu cuota.</div>
      </div>
      </div>
      <button onClick=${v.toContrato} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Ir al contrato</button>
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      <!-- ============ CRÉDITO · CONTRATO ============ -->
      ${v.isCredContrato && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.toResumen} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:0 16px 16px">
      <h1 style="margin:12px 0 0;font-size:26px;font-weight:700">Este será nuestro contrato</h1>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.4">Es importante que leas y conozcas las condiciones de tu crédito.</p>
      <div style="display:flex;flex-direction:column;gap:18px;margin-top:24px">
      <div style="display:flex;gap:14px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="flex:0 0 26px"><path d="M19 5L5 19" style="stroke: #c4006f; border-color: #c4006f"></path><circle cx="7" cy="7" r="2.5" style="stroke: #c4006f; stroke-width: 2px"></circle><circle cx="17" cy="17" r="2.5" style="stroke: #c4006f; stroke-width: 2px"></circle></svg><div><div style="font-size:16px;font-weight:700">La tasa es de ${v.tasaEA} E.A.</div><div style="font-size:14px;color:#6E6573;line-height:1.4;margin-top:2px">Es la tasa de tu contrato y es fija. Nunca será más alta que la tasa de usura.</div></div></div>
      <div style="display:flex;gap:14px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 26px"><path d="M4 12a8 8 0 0 1 14-5.3M18 3v4h-4" style="stroke: #c4006f; border-color: #c4006f"></path><circle cx="6" cy="18" r="1.6" style="stroke: #c4006f; stroke-width: 2px"></circle><circle cx="12" cy="18" r="1.6" style="stroke: #c4006f; stroke-width: 2px"></circle><circle cx="18" cy="18" r="1.6" style="stroke: #c4006f; stroke-width: 2px"></circle></svg><div><div style="font-size:16px;font-weight:700">Flexibilidad en los pagos</div><div style="font-size:14px;color:#6E6573;line-height:1.4;margin-top:2px">Puedes hacer abonos desde tu Nequi y revisar tu plan de pagos en la app.</div></div></div>
      <div style="display:flex;gap:14px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="flex:0 0 26px"><path d="M5 3h14v18H5z" style="stroke: #c4006f; border-color: #c4006f"></path><path d="M9 8h6M9 12h6M9 16h2" style="stroke: #c4006f; border-color: #c4006f"></path></svg><div><div style="font-size:16px;font-weight:700">Siempre vas a tener transparencia</div><div style="font-size:14px;color:#6E6573;line-height:1.4;margin-top:2px">Revisa el resumen de tu compra y tus cuotas en tus movimientos.</div></div></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:#E6FAFD;border-radius:8px;padding:16px 18px;margin-top:28px">
      <div style="flex:1"><div style="font-size:17px;font-weight:600;color:#136F7A">Revisa tu contrato completo</div><div style="font-size:14px;line-height:1.4;margin-top:4px">Siempre va a estar disponible en tu app por si quieres revisarlo de nuevo.</div></div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#136F7A" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
      </div>
      <label style="display:flex;align-items:center;gap:12px;margin-top:22px;font-size:15px;line-height:1.35;cursor:pointer">
      <input type="checkbox" checked=${v.accept} onChange=${v.toggleAccept} style="width:22px;height:22px;margin:0;accent-color:#DA0081;flex:0 0 22px" />He leído y acepto el contrato y el cobro de la fianza</label>
      </div>
      ${v.accept && html`<button onClick=${v.toValida} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Continuar</button>`}
      ${v.notAccept && html`<button disabled=${true} style="width:100%;height:52px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;cursor:default">Continuar</button>`}
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      <!-- ============ CRÉDITO · VALIDAR IDENTIDAD ============ -->
      ${v.isCredValida && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.toContrato} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <h1 style="margin:12px 0 0;font-size:26px;font-weight:700">Queremos validar que eres tú</h1>
      <div style="display:flex;flex-direction:column;margin-top:14px">
      <div style="padding:14px 0;border-bottom:1px solid #EEEAF0"><div style="display:flex;align-items:center;gap:12px;font-size:17px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>Busca un sitio con buena luz</div><div style="font-size:14px;color:#6E6573;margin-top:6px;line-height:1.4">Pero no tanta... ¡Queremos verte bien! En la foto solo debes salir tú.</div></div>
      <div style="padding:14px 0;border-bottom:1px solid #EEEAF0"><div style="display:flex;align-items:center;gap:12px;font-size:17px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="6.5" cy="13" r="4"></circle><circle cx="17.5" cy="13" r="4"></circle><path d="M10.5 13h3M2.5 13V11M21.5 13v-2"></path></svg>Quítate las gafas, porfa</div><div style="font-size:14px;color:#6E6573;margin-top:6px;line-height:1.4">Y deja tu cel a la altura de tu cara.</div></div>
      <div style="padding:14px 0"><div style="display:flex;align-items:center;gap:12px;font-size:17px;line-height:1.3"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" aria-hidden="true" style="flex:0 0 26px"><rect x="6" y="2" width="12" height="20" rx="2"></rect></svg>Sigue las instrucciones que te van a salir en pantalla</div><div style="font-size:14px;color:#6E6573;margin-top:6px;line-height:1.4">Enfoca tu cara y acerca tu cel poco a poco.</div></div>
      </div>
      <div style="margin-top:auto"></div>
      <button onClick=${v.toFacial} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Validar</button>
      <button onClick=${v.toInicio} style="background:none;border:none;color:#DA0081;font-size:17px;padding:14px 0 0">Salir</button>
      </div>
      `}
      
      <!-- ============ CRÉDITO · RECONOCIMIENTO FACIAL ============ -->
      ${v.isCredFacial && html`
      <div style="position:absolute;inset:0;background:#7F6A9A;color:#fff;display:flex;flex-direction:column">
      <div style="background:#4B2E6E;padding:40px 16px 0;height:96px;box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:center">
      <button onClick=${v.toValida} aria-label="Volver" style="position:absolute;left:16px;top:44px;background:none;border:none;color:#fff;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <div style="font-size:17px;font-weight:700;padding-top:4px">Reconocimiento facial</div>
      </div>
      <div style="text-align:center;font-size:16px;line-height:1.35;margin-top:16px">¿Estás preparado?<br />¡Encuádrate!</div>
      <button onClick=${v.simulateFacial} style="align-self:center;margin-top:60px;width:270px;height:390px;border-radius:50%;background:#fff;border:none;color:#4B2E6E;font-size:15px;font-weight:600;padding:0 40px;line-height:1.4">Toca para simular el reconocimiento</button>
      </div>
      `}
      
      ${v.ovConfirm && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.5)">
      <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:28px 28px 0 0;padding:18px 20px 28px">
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#200020;padding:4px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <h2 style="margin:0 0 10px;font-size:28px;font-weight:700">Confirma el envío</h2>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:16px">
      <div><div style="color:#C4006F;font-size:15px">Vas a enviar a:</div><div>${v.maskedName}</div></div>
      <div><div style="color:#C4006F;font-size:15px">A la llave</div><div>${v.payLlave}</div></div>
      <div><div style="color:#C4006F;font-size:15px">Banco destino</div><div>${v.bank}</div></div>
      <div><div style="color:#C4006F;font-size:15px">¿Cuánto?</div><div>${v.amountConfirm}</div></div>
      </div>
      <div style="font-size:15px;color:#5E5563;margin-top:14px">La plata saldrá de:</div>
      ${v.srcDisp && html`
      <div style="display:flex;align-items:center;gap:12px;border:1px solid #E3DFE6;border-radius:4px;padding:5px;margin-top:8px">
      <div style="position:relative;width:40px;height:40px;background:#DA0081;border-radius:4px"><span style="position:absolute;left:4px;top:4px;width:14px;height:14px;background:#EC7FBC"></span><span style="position:absolute;left:21px;top:11px;width:7px;height:7px;background:#F9DCEC"></span><span style="position:absolute;left:7px;top:22px;width:7px;height:7px;background:#F9DCEC"></span><span style="position:absolute;left:20px;top:21px;width:15px;height:15px;background:#EC7FBC"></span></div>
      <span style="font-size:17px">Disponible</span>
      </div>
      `}
      ${v.srcCont && html`
      <div style="display:flex;align-items:center;gap:12px;border:1px solid #E3DFE6;border-radius:4px;padding:5px;margin-top:8px">
      <span style="position:relative;width:40px;height:40px;background:#DA0081;border-radius:4px;flex:0 0 40px;overflow:hidden"><span style="position:absolute;left:3px;top:0;width:16px;height:12px;border-radius:0 0 2px 2px;background:#E569B1"></span><span style="position:absolute;left:23px;top:3px;width:10px;height:10px;border-radius:2px;background:#E569B1"></span><span style="position:absolute;left:10px;top:18px;width:10px;height:14px;border-radius:2px;background:#E569B1"></span><span style="position:absolute;left:23px;top:17px;width:18px;height:15px;border-radius:2px;background:#E569B1"></span></span>
      <span style="font-size:17px">${v.creditName}</span><span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:600;border-radius:10px;padding:1px 8px">crédito</span>
      </div>
      `}
      ${v.srcCred && html`
      <div style="display:flex;align-items:center;gap:12px;border:1px solid #E3DFE6;border-radius:4px;padding:5px;margin-top:8px">
      <div style="position:relative;width:40px;height:40px;background:#5B2A8C;border-radius:4px"><span style="position:absolute;left:4px;top:4px;width:14px;height:14px;background:#B9A6D6"></span><span style="position:absolute;left:21px;top:11px;width:7px;height:7px;background:#E6DDF2"></span><span style="position:absolute;left:7px;top:22px;width:7px;height:7px;background:#E6DDF2"></span><span style="position:absolute;left:20px;top:21px;width:15px;height:15px;background:#B9A6D6"></span></div>
      <span style="font-size:17px">Crédito preaprobado</span>
      </div>
      `}
      <button onClick=${v.enviar} style="width:100%;height:50px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:18px">Enviar</button>
      <button onClick=${v.closeOverlay} style="width:100%;height:50px;background:#fff;color:#200020;border:1.5px solid #200020;border-radius:4px;font-size:17px;margin-top:12px">Corregir</button>
      </div>
      </div>
      `}
      
      <!-- ============ RESULTADO (no capturado: supuesto) ============ -->
      ${v.isResult && html`
      ${v.resultOk && html`
      <div role="status" aria-label=${v.okLine} style="position:absolute;inset:0;background:#fff;display:flex;align-items:center;justify-content:center">
      <div style="width:200px;height:180px;background:#59D8EB;border-radius:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;animation:nqpop 0.45s cubic-bezier(0.34,1.56,0.64,1) both">
      <svg width="92" height="70" viewBox="0 0 92 70" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 32l27 28L86 6"></path></svg>
      <div style="font-size:18px;font-weight:500;color:#200020">¡Listo!</div>
      </div>
      </div>
      `}
      ${v.resultInsuf && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:120px 24px 28px;box-sizing:border-box;text-align:center;align-items:center">
      <div style="width:72px;height:72px;border-radius:50%;background:#FBE3F0;color:#200020;font-size:36px;font-weight:800;display:flex;align-items:center;justify-content:center">!</div>
      <h1 style="margin:24px 0 0;font-size:28px;font-weight:700;line-height:1.2">Tu Disponible no alcanza</h1>
      <p style="margin:12px 0 0;font-size:17px;line-height:1.4">${v.faltan}</p>
      <button onClick=${v.fixAmount} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:auto">Corregir el valor</button>
      <button onClick=${v.toInicio} style="width:100%;height:52px;background:#fff;color:#200020;border:1.5px solid #200020;border-radius:4px;font-size:17px;margin-top:12px">Volver al inicio</button>
      </div>
      `}
      `}
      
      <!-- ============ MOVIMIENTOS ============ -->
      ${v.isMovs && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding-top:40px;box-sizing:border-box">
      <h1 style="margin:8px 16px 0;font-size:18px;font-weight:700">Movimientos</h1>
      ${v.showSearch && html`
      <label style="display:flex;align-items:center;gap:8px;background:#FBF5F9;border-radius:4px;height:40px;padding:0 12px;margin:12px 16px 0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E5563" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>
      <input value=${v.movQuery} onInput=${v.onMovQuery} placeholder="Busca" aria-label="Busca en tus movimientos" style="flex:1;min-width:0;background:none;border:none;outline:none;font-size:15px;color:#200020" />
      </label>
      `}
      <div class="nq-noscroll" style="display:flex;gap:8px;padding:14px 16px 4px;overflow-x:auto;flex:0 0 auto">
      ${v.movTabs.map((t) => html`
      <button onClick=${t.pick} aria-pressed=${t.sel} style="flex:0 0 auto;height:34px;padding:0 18px;border-radius:6px;font-size:14px;background:${t.bg};color:${t.fg};border:${t.border}">${t.label}</button>
      `)}
      </div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;padding:4px 16px 100px">
      ${v.movGroups.map((g) => html`
      ${g.showLabel && html`<div style="font-size:15px;color:#6E6573;margin:12px 0 8px">${g.label}</div>`}
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
      ${g.items.map((m) => html`
      <div style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:14px">
      ${m.isOut && html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 22px"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v9M8 12l4 4 4-4"></path></svg>`}
      ${m.isIn && html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12804A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 22px"><circle cx="12" cy="12" r="9"></circle><path d="M12 17V8M8 12l4-4 4 4"></path></svg>`}
      <div style="flex:1;min-width:0"><div style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.title}</div><div style="display:flex;align-items:center;gap:6px;margin-top:2px;font-size:13px;color:#6E6573">${m.sub}${m.isCred && html`<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:600;border-radius:10px;padding:1px 8px">crédito</span>`}</div></div>
      <div style="font-size:16px;font-weight:600;color:${m.color}">${m.amount}</div>
      </div>
      `)}
      </div>
      `)}
      ${v.movEmpty && html`<p style="font-size:15px;color:#6E6573;margin:20px 0 0">No encontramos movimientos.</p>`}
      </div>
      <div style="position:absolute;left:16px;bottom:20px;width:278px;height:58px;background:#fff;border-radius:8px;box-shadow:0 4px 18px rgba(32,0,32,0.14);display:flex;padding:4px;box-sizing:border-box;gap:2px">
      <button onClick=${v.toInicioPlain} style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;background:none;border:none;border-radius:6px;color:#200020;padding:0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v10H3z"></path></svg>Inicio</button>
      <div style="flex:1;background:#ECE8F4;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;font-weight:700"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" fill="#200020"></rect><path d="M9 8h6M9 12h6M9 16h4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"></path></svg>Movimientos</div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#200020" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"></rect><rect x="13" y="4" width="7" height="7" rx="1"></rect><rect x="4" y="13" width="7" height="7" rx="1"></rect><rect x="13" y="13" width="7" height="7" rx="1"></rect></svg>Servicios</div>
      </div>
      <button onClick=${v.openFab} aria-label="Pagos y transferencias" style="position:absolute;right:16px;bottom:20px;width:58px;height:58px;background:#DA0081;border:none;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18"></path><path d="M17 7c-1-1.5-2.7-2-5-2-3 0-4.5 1.5-4.5 3.3 0 4.5 10 2.4 10 7.2 0 2-1.8 3.5-5 3.5-2.5 0-4.3-.8-5.5-2.3"></path></svg></button>
      </div>
      `}
      
      <!-- ============ CRÉDITOS (PAGO) ============ -->
      ${v.isCredPagos && html`
      <div class="nq-noscroll" style="position:absolute;inset:0;background:#fff;overflow-y:auto">
      <div style="background:#2A0A2E;color:#fff;padding:40px 16px 18px">
      <div style="display:flex;align-items:center;gap:14px;height:48px">
      <button onClick=${v.backFromCredPagos} aria-label="Volver" style="background:none;border:none;color:#fff;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button>
      <h1 style="margin:0;flex:1;font-size:22px;font-weight:700">Créditos</h1>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.7M12 17h.01"></path></svg>
      </div>
      <div style="text-align:center;margin-top:26px"><div style="font-size:16px">Cuota mensual</div><div style="font-size:38px;font-weight:800;margin-top:4px">${v.pCuota}</div></div>
      <div style="display:flex;justify-content:center;gap:26px;margin-top:18px">
      <button onClick=${v.goQuePagar} style="display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;font-size:14px;line-height:1.2;padding:0;width:76px"><span style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18"></path><path d="M17 7c-1-1.5-2.7-2-5-2-3 0-4.5 1.5-4.5 3.3 0 4.5 10 2.4 10 7.2 0 2-1.8 3.5-5 3.5-2.5 0-4.3-.8-5.5-2.3"></path></svg></span>Pagar crédito</button>
      <button onClick=${v.goCredDetallesPago} style="display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;font-size:14px;line-height:1.2;padding:0;width:76px"><span style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h3"></path></svg></span>Info de tu crédito</button>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:14px;line-height:1.2;width:76px;text-align:center"><span style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path></svg></span>Ayudas para ti</div>
      </div>
      <div style="background:rgba(255,255,255,0.12);border-radius:8px;padding:14px 16px;margin-top:20px">
      <div style="display:flex;justify-content:space-between;font-size:15px"><span>Debes</span><span style="font-size:18px;font-weight:600">${v.pDebe}</span></div>
      <div style="height:8px;background:#ECE8F4;border-radius:4px;margin:12px 0;overflow:hidden"><div style="height:100%;width:${v.pProgress};background:#DA0081;border-radius:4px"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:15px"><span>Cuotas pagadas</span><span style="font-size:17px">${v.pPagadas}</span></div>
      </div>
      </div>
      <div style="padding:0 16px 32px">
      <div style="display:flex;align-items:center;gap:12px;background:#E6FAFD;border-radius:0 0 8px 8px;padding:12px 16px;font-size:16px;font-weight:600;color:#136F7A">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#136F7A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 12l3 3 5-6"></path></svg>${v.pProximo}</div>
      ${v.pActivo && html`
      <div style="display:flex;gap:12px;background:#E6FAFD;border:1px solid #9FE3EC;border-radius:8px;padding:14px 16px;margin-top:16px">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#136F7A" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="flex:0 0 22px"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg>
      <div><div style="font-size:16px;font-weight:700">Baja el valor de tu cuota mensual</div><div style="font-size:14px;line-height:1.45;margin-top:4px">Amplía el plazo de tu crédito y date un respiro para pagar con más calma. Puedes elegirlo en "Pagar crédito".</div></div>
      </div>
      `}
      <h2 style="margin:24px 0 0;font-size:18px;font-weight:600">Historial de pagos</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
      ${v.pHistory.map((h) => html`
      <div style="border:1px solid #E3DFE6;border-radius:8px;padding:12px 16px">
      <div style="font-size:14px;color:#5E5563">${h.date}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><span style="font-size:16px;font-weight:600;text-transform:uppercase">${h.label}</span><span style="font-size:16px;font-weight:600;color:#C4006F">${h.amount}</span></div>
      </div>
      `)}
      ${v.pNoHistory && html`<p style="margin:0;font-size:15px;color:#6E6573">Aún no has hecho pagos a este crédito.</p>`}
      </div>
      </div>
      </div>
      `}
      
      <!-- ============ ¿QUÉ QUIERES PAGAR? ============ -->
      ${v.isQuePagar && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.goCredPagos} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:0 16px 16px">
      <h1 style="margin:12px 0 0;font-size:26px;font-weight:700">¿Qué quieres pagar?</h1>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px">
      ${v.payOpts.map((o) => html`
      <button onClick=${o.pick} aria-pressed=${o.sel} style="width:100%;display:flex;align-items:flex-start;gap:12px;background:#fff;border:${o.border};border-radius:4px;padding:14px;text-align:left;color:#200020">
      <span style="flex:1"><span style="display:block;font-size:15px;font-weight:700">${o.title}</span>
      ${o.hasAmount && html`<span style="display:block;font-size:18px;margin-top:4px">${o.amount}</span>`}
      ${o.hasNote && html`<span style="display:block;font-size:13px;line-height:1.4;margin-top:8px">Con esta opción <strong>aceptas ampliar el plazo de tu crédito 12 meses</strong>, manteniendo las mismas condiciones.</span>`}
      </span>
      <span style="width:22px;height:22px;border-radius:50%;border:2px solid ${o.ring};box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:0 0 22px;margin-top:2px">${o.sel && html`<span style="width:10px;height:10px;border-radius:50%;background:#DA0081"></span>`}</span>
      </button>
      `)}
      </div>
      ${v.payIsOtro && html`
      <input value=${v.payOtroDisplay} onInput=${v.onPayOtro} inputmode="numeric" placeholder="¿Cuánto?" aria-label="¿Cuánto quieres pagar?" style="width:100%;box-sizing:border-box;background:#FBF5F9;border:none;border-radius:4px;height:58px;padding:0 18px;margin-top:10px;font-size:17px;outline:none;color:#200020" />
      <div style="font-size:13px;color:#6E6573;margin-top:6px">Puede ser hasta ${v.payTotalText}. Lo que pase de tu cuota abona a capital.</div>
      `}
      <div style="font-size:14px;color:#5E5563;margin-top:18px">Se paga desde tu Disponible: tienes ${v.saldoText}</div>
      ${v.payNoAlcanza && html`<div style="font-size:13px;color:#C4006F;margin-top:4px">Tu Disponible no alcanza para este pago.</div>`}
      </div>
      ${v.canPay && html`<button onClick=${v.doPay} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Pagar</button>`}
      ${v.cantPay && html`<button disabled=${true} style="width:100%;height:52px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;cursor:default">Pagar</button>`}
      </div>
      `}
      
      <!-- ============ ASÍ ESTÁ TU PLATA ============ -->
      ${v.isAsiPlata && html`
      <div style="position:absolute;inset:0;background:#200020;color:#fff;display:flex;flex-direction:column;padding:40px 16px 0;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.toInicioPlain} aria-label="Volver" style="background:none;border:none;color:#fff;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <h1 style="margin:10px 0 0;font-size:26px;font-weight:700">Así está tu plata</h1>
      <div style="text-align:center;margin-top:22px"><div style="font-size:15px">Toda tu plata suma</div><div style="font-size:28px;font-weight:600;margin-top:2px">${v.totalPlata}</div></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px;margin-top:20px;padding:0 4px 12px">
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.18);border-radius:6px;padding:14px 18px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle></svg><div style="flex:1"><div style="font-size:17px">Disponible</div><div style="font-size:14px;color:#E9E2EC">${v.saldoText}</div></div></div>
      <button onClick=${v.goCreditos} style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.18);border:none;border-radius:6px;padding:14px 18px;color:#fff;text-align:left"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="6" r="3"></circle><path d="M2 20l4-3h5l5-4c1-.8 2.4-.3 2.4 1 0 .4-.2.8-.5 1.1L13 20H2z"></path><path d="M15 3.5h4M17 1.5v4"></path></svg><span style="flex:1"><span style="display:block;font-size:17px">Préstamos</span><span style="display:block;font-size:14px;color:#E9E2EC">${v.creditBalanceText}</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.18);border-radius:6px;padding:14px 18px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" aria-hidden="true"><rect x="6" y="7" width="12" height="14" rx="2"></rect><path d="M9 7V4h6v3M10.5 13h3"></path></svg><div style="flex:1"><div style="font-size:17px">Bolsillos</div><div style="font-size:14px;color:#E9E2EC">$ 0</div></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.18);border-radius:6px;padding:14px 18px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="1.5"></rect><path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01"></path></svg><div style="flex:1"><div style="font-size:17px">Colchón</div><div style="font-size:14px;color:#E9E2EC">$ 0</div></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.18);border-radius:6px;padding:14px 18px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M4 13c0-4 3.6-7 8-7 3 0 5.5 1.3 6.8 3.3L21 9v4l-2 .5c-.5 1.6-1.6 2.9-3 3.7V20h-3v-2h-2v2H8v-3C5.6 15.8 4 14.5 4 13z"></path><path d="M10 6.2C10 4.4 11.3 3 13 3s3 1.4 3 3"></path></svg><div style="flex:1"><div style="font-size:17px">Metas</div><div style="font-size:14px;color:#E9E2EC">Ahorra para un sueño acá</div></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;background:#ECE8F4;color:#200020;border-radius:8px 8px 0 0;padding:14px 20px 26px;font-size:16px">Tus topes<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 15l6-6 6 6"></path></svg></div>
      </div>
      `}
      
      <!-- ============ TUS CRÉDITOS ============ -->
      ${v.isCreditos && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.goAsiPlata} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <h1 style="margin:10px 0 0;font-size:26px;font-weight:700">Tus Préstamos</h1>
      ${v.hasCredit && html`
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px">
      <button onClick=${v.goCredito} aria-label=${v.creditCardLabel} style="background:#fff;border:none;border-radius:8px;box-shadow:0 2px 10px rgba(32,0,32,0.14);padding:0;overflow:hidden;text-align:left;color:#200020">
      <span style="display:block;position:relative;height:72px;background:#DA0081"><span style="position:absolute;left:0;top:0;width:28px;height:28px;background:#E569B1"></span><span style="position:absolute;left:36px;top:12px;width:22px;height:22px;border-radius:3px;background:#E569B1"></span><span style="position:absolute;left:8px;top:42px;width:22px;height:22px;border-radius:3px;background:#E569B1"></span><span style="position:absolute;left:36px;top:42px;width:30px;height:30px;border-radius:3px;background:#E569B1"></span><span style="position:absolute;right:10px;top:10px;width:40px;height:40px;border-radius:4px;background:#fff;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A0A5E" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18"></path><path d="M17 7c-1-1.5-2.7-2-5-2-3 0-4.5 1.5-4.5 3.3 0 4.5 10 2.4 10 7.2 0 2-1.8 3.5-5 3.5-2.5 0-4.3-.8-5.5-2.3"></path></svg></span></span>
      <span style="display:block;padding:10px 12px 14px"><span style="display:block;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.creditName}</span><span style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:4px"><span style="font-size:14px;color:#5E5563">${v.creditBalanceText}</span><span style="background:#E6FAFD;color:#136F7A;font-size:13px;font-weight:600;border-radius:12px;padding:3px 10px">crédito</span></span></span>
      </button>
      </div>
      `}
      ${v.noCredit && html`
      <p style="margin:20px 0 0;font-size:16px;color:#6E6573;line-height:1.4">Aún no tienes créditos. Cuando pagues con tu preaprobado, lo que sobre aparecerá aquí.</p>
      `}
      </div>
      `}
      
      <!-- ============ CONTENEDOR DE CRÉDITO ============ -->
      ${v.isCredito && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.goCreditos} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:4px 16px 16px">
      <button onClick=${v.goCredDetalles} aria-label="Ver detalles de tu crédito" style="width:100%;display:block;background:#fff;border:1px solid #E3DFE6;border-radius:8px;padding:0;overflow:hidden;text-align:left;color:#200020;box-shadow:0 1px 4px rgba(32,0,32,0.08)">
      <span style="display:block;position:relative;height:72px;background:#DA0081"><span style="position:absolute;left:10px;top:0;width:44px;height:30px;border-radius:0 0 3px 3px;background:#E569B1"></span><span style="position:absolute;left:62px;top:6px;width:26px;height:26px;border-radius:3px;background:#E569B1"></span><span style="position:absolute;left:30px;top:44px;width:24px;height:28px;border-radius:3px 3px 0 0;background:#E569B1"></span><span style="position:absolute;left:62px;top:40px;width:44px;height:32px;border-radius:3px 3px 0 0;background:#E569B1"></span><span style="position:absolute;right:12px;bottom:10px"><span style="background:#E6FAFD;color:#136F7A;font-size:13px;font-weight:600;border-radius:12px;padding:3px 10px">crédito</span></span></span>
      <span style="display:flex;align-items:center;padding:12px 16px 14px"><span style="flex:1"><span style="display:block;font-size:16px">${v.creditName}</span><span style="display:block;font-size:24px;font-weight:600;margin-top:2px">${v.creditBalanceText}</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></span>
      </button>
      <button onClick=${v.openNombre} aria-label="Cambiar el nombre del crédito" style="width:100%;display:flex;align-items:center;gap:12px;background:#FBF5F9;border:none;border-radius:4px;padding:10px 18px;margin-top:16px;text-align:left;color:#200020"><span style="flex:1;min-width:0"><span style="display:block;font-size:14px;color:#C4006F">Nombre del crédito</span><span style="display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.creditName}</span></span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="M13.5 6.5l4 4"></path></svg></button>
      <button onClick=${v.openMover} style="width:100%;display:flex;align-items:center;justify-content:space-between;background:#FBF5F9;border:none;border-radius:4px;height:56px;padding:0 18px;margin-top:8px;font-size:17px;color:#200020">Mover plata<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
      <h2 style="margin:26px 0 0;font-size:19px;font-weight:700">Movimientos de tu crédito</h2>
      <div style="font-size:15px;color:#6E6573;margin-top:6px">Hoy</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
      ${v.creditMovs.map((m) => html`
      <div style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #E3DFE6;border-radius:4px;box-shadow:0 1px 3px rgba(32,0,32,0.08);padding:12px 14px">
      ${m.sale && html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 24px"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v9M8 12l4 4 4-4"></path></svg>`}
      ${m.entra && html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12804A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 24px"><circle cx="12" cy="12" r="9"></circle><path d="M12 17V8M8 12l4-4 4 4"></path></svg>`}
      <div style="flex:1;min-width:0"><div style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.title}</div><div style="font-size:13px;color:#6E6573">${m.sub}</div></div>
      <div style="font-size:16px;font-weight:700;color:${m.color}">${m.amount}</div>
      </div>
      `)}
      </div>
      </div>
      <button onClick=${v.goCredPagos} style="width:100%;height:52px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px">Ir a este crédito</button>
      </div>
      `}
      
      <!-- ============ DETALLES DE TU CRÉDITO ============ -->
      ${v.isCredDetalles && html`
      <div style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column;padding:40px 16px 20px;box-sizing:border-box">
      <div style="height:48px;display:flex;align-items:center"><button onClick=${v.backFromDetalles} aria-label="Volver" style="background:none;border:none;color:#200020;padding:6px 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"></path></svg></button></div>
      <div class="nq-noscroll" style="flex:1;min-height:0;overflow-y:auto;margin:0 -16px;padding:0 16px 16px">
      <h1 style="margin:12px 0 0;font-size:26px;font-weight:700">Detalles de tu crédito</h1>
      <div style="border:1.5px solid #DA0081;border-radius:8px;padding:16px 18px;margin-top:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:15px">Cuota mensual<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:4px"><span style="font-size:28px;font-weight:800;color:#C4006F">${v.cCuota}</span>${v.cSin && html`<span style="background:#E6FAFD;color:#136F7A;font-size:12px;font-weight:700;border-radius:12px;padding:3px 10px">Sin interés</span>`}</div>
      <div style="font-size:13px;color:#6E6573">Incluye capital, seguro e intereses</div>
      <div style="height:1px;background:#EEEAF0;margin:14px 0"></div>
      <div style="display:flex;align-items:center;gap:12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2"></path></svg><div><div style="font-size:13px;color:#6E6573">Tu fecha de pago</div><div style="font-size:16px">${v.fechaPago} de cada mes</div></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;margin-top:22px">
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle></svg><div><div style="font-size:13px;color:#6E6573">Capital + fianza</div><div style="font-size:16px">${v.cCapital}</div></div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"></rect><path d="M14.5 9c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.4.7-2.4 1.7 0 2.4 5 1.2 5 3.7 0 1-1 1.8-2.6 1.8-1.2 0-2.1-.4-2.7-1.2M12 6.5v1.3M12 16.2v1.3"></path></svg><div><div style="font-size:13px;color:#6E6573">Fianza (4 %)</div><div style="font-size:16px">${v.cFianza}</div></div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path></svg><div><div style="font-size:13px;color:#6E6573">Tu seguro mensual</div><div style="font-size:16px">${v.cSeguro}</div></div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"></path></svg><div style="font-size:15px;line-height:1.4"><div style="font-size:13px;color:#6E6573">Tasa de interés fija</div>${v.cConInteres && html`<div style="text-decoration:line-through;color:#6E6573">${v.tasaOld}</div><div>${v.tasaNew}</div>`}${v.cSin && html`<div>0 % · sin interés</div>`}</div></div>
      <div style="display:flex;gap:14px;align-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DA0081" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg><div><div style="font-size:13px;color:#6E6573">Plazo</div><div style="font-size:16px">${v.cPlazo}</div></div></div>
      </div>
      <div style="background:#E6FAFD;border-radius:8px;padding:16px 18px;margin-top:22px">
      <div style="font-size:17px;font-weight:600;color:#136F7A">Pagos automáticos</div>
      <div style="font-size:14px;line-height:1.45;margin-top:6px">Deja tu plata en tu Nequi y nosotros haremos el pago automáticamente en la fecha de pago de tu cuota.</div>
      </div>
      </div>
      </div>
      `}
      
      ${v.ovNombre && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.5)">
      <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:28px 28px 0 0;padding:16px 16px 28px">
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#200020;padding:4px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <h2 style="margin:0;font-size:21px;font-weight:700;line-height:1.25">Cambia el nombre de tu crédito</h2>
      <p style="margin:8px 0 0;font-size:15px;line-height:1.4;color:#5E5563">Ponle un nombre que te ayude a recordar para qué es. La etiqueta crédito se mantiene.</p>
      <label style="display:block;background:#FBF5F9;border-radius:4px;padding:8px 18px;margin-top:16px"><span style="display:block;font-size:13px;color:#C4006F">Nombre del crédito</span><input value=${v.nombreValue} onInput=${v.onNombre} maxlength="24" aria-label="Nombre del crédito" style="width:100%;box-sizing:border-box;background:none;border:none;outline:none;height:32px;padding:0;font-size:17px;color:#200020" /></label>
      <div style="font-size:13px;color:#6E6573;margin-top:6px">Máximo 24 caracteres</div>
      ${v.canNombre && html`<button onClick=${v.saveNombre} style="width:100%;height:50px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:20px">Guardar</button>`}
      ${v.cantNombre && html`<button disabled=${true} style="width:100%;height:50px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:20px;cursor:default">Guardar</button>`}
      </div>
      </div>
      `}
      ${v.ovMover && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.5)">
      <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:28px 28px 0 0;padding:16px 16px 28px">
      <div style="display:flex;justify-content:flex-end"><button onClick=${v.closeOverlay} aria-label="Cerrar" style="background:none;border:none;color:#200020;padding:4px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
      <h2 style="margin:0;font-size:21px;font-weight:700;line-height:1.25">Selecciona cuánto quieres mover y a dónde</h2>
      <div style="display:flex;align-items:center;gap:8px;background:#FBF5F9;border-radius:4px;padding:6px 10px 6px 18px;margin-top:16px">
      <input value=${v.moveDisplay} onInput=${v.onMove} inputmode="numeric" placeholder="¿Cuánto vas a mover?" aria-label="¿Cuánto vas a mover?" style="flex:1;min-width:0;background:none;border:none;outline:none;height:44px;font-size:16px;color:#200020" />
      <button onClick=${v.moveMinus} aria-label="Restar $ 10.000" style="width:40px;height:36px;background:#ECE8F4;border:none;border-radius:4px;color:#200020;font-size:20px">−</button>
      <button onClick=${v.movePlus} aria-label="Sumar $ 10.000" style="width:40px;height:36px;background:#ECE8F4;border:none;border-radius:4px;color:#200020;font-size:20px">+</button>
      </div>
      <div style="font-size:13px;color:#6E6573;margin-top:6px">Tienes ${v.creditBalanceText} en tu préstamo</div>
      ${v.moveError && html`<div style="font-size:13px;color:#C4006F;margin-top:4px">No puedes mover más de lo que tienes en tu crédito.</div>`}
      <div style="font-size:15px;color:#5E5563;margin-top:16px">La plata llegará a:</div>
      <div style="display:flex;align-items:center;gap:12px;border:1px solid #E3DFE6;border-radius:4px;padding:5px;margin-top:8px">
      <div style="position:relative;width:40px;height:40px;background:#DA0081;border-radius:4px"><span style="position:absolute;left:4px;top:4px;width:14px;height:14px;background:#EC7FBC"></span><span style="position:absolute;left:21px;top:11px;width:7px;height:7px;background:#F9DCEC"></span><span style="position:absolute;left:7px;top:22px;width:7px;height:7px;background:#F9DCEC"></span><span style="position:absolute;left:20px;top:21px;width:15px;height:15px;background:#EC7FBC"></span></div>
      <span style="font-size:17px">Disponible</span>
      </div>
      ${v.canMove && html`<button onClick=${v.doMove} style="width:100%;height:50px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:20px">Enviar</button>`}
      ${v.cantMove && html`<button disabled=${true} style="width:100%;height:50px;background:#EE86C2;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:20px;cursor:default">Enviar</button>`}
      </div>
      </div>
      `}
      
      <!-- ============ DESEMBOLSO EXITOSO (sobre Inicio) ============ -->
      ${v.ovDesembolso && html`
      <div style="position:absolute;inset:0;background:rgba(32,0,32,0.45);display:flex;align-items:center;justify-content:center;padding:0 22px">
      <div role="dialog" aria-label="Desembolso exitoso" style="background:#fff;border-radius:8px;padding:28px 22px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;animation:nqpop 0.35s ease-out both">
      <svg width="72" height="72" viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M24 4l2 6M14 9l5 4M10 19l6 1M34 6l-2 6" stroke="#DA0081" stroke-width="2.2"></path><path d="M22 52c-4-2-6-6-6-10 0-3 1-6 3-8l4-4V20c0-2 1.5-3.5 3.5-3.5S30 18 30 20v10h12c2.2 0 4 1.8 4 4s-1.8 4-4 4h1c2.2 0 4 1.8 4 4s-1.8 4-4 4h-1c2 0 3.5 1.6 3.5 3.5S43.9 53 42 53H30c-3 0-5.5-.3-8-1z" stroke="#200020" stroke-width="2.4"></path></svg>
      <h2 style="margin:14px 0 0;font-size:20px;font-weight:800">¡Desembolso exitoso!</h2>
      <p style="margin:12px 0 0;font-size:15px;line-height:1.45;color:#4E4253;white-space:pre-line">${v.desembolsoText}</p>
      ${v.hasContainer && html`<button onClick=${v.goCreditos} style="width:100%;height:50px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:22px">Ir a Préstamos</button>`}
      ${v.noContainer && html`<button onClick=${v.goCredPagos} style="width:100%;height:50px;background:#DA0081;color:#fff;border:none;border-radius:4px;font-size:17px;margin-top:22px">Ir a crédito</button>`}
      </div>
      </div>
      `}

      <!-- ============ TOAST ============ -->
      ${v.toast && html`
      <div role="status" style="position:absolute;left:16px;right:16px;top:52px;z-index:60;display:flex;align-items:center;gap:12px;background:#200020;color:#fff;border-radius:8px;padding:14px 16px;box-shadow:0 8px 24px rgba(32,0,32,0.28);font-size:16px;animation:nqtoast 2.6s ease both">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#59D8EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 22px"><circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l2.5 2.5L16 9.5"></path></svg>
      ${v.toast}
      </div>
      `}
      </div>
    `;
  }
}
