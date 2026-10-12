// Recorrido del prototipo por momentos: Pago → Movimientos → Abono (Contexto/nequi-presentacion-texto.md).
// Cada sección tiene un título que ya es la conclusión, hasta 4 líneas y sus pasos.
// Cada paso lleva el teléfono a un estado del prototipo (`estado`); `activaEn` agrega otros estados que lo resaltan.
// `credit: false` arranca sin crédito tomado, para mostrar el camino del crédito nuevo.
export const secciones = [
  {
    etiqueta: 'Pago',
    titulo: 'Pagar con crédito usa pasos que Nequi ya tiene, y pagar desde el contenedor del crédito es igual a pagar con "Disponible"',
    lineas: [
      'El acceso a la cámara sigue en 3 taps desde "Inicio".',
      'Resumen, contrato y verificación de identidad son los pasos que Nequi ya usa al pedir un crédito; aquí aparecen en el momento del pago.',
      'Con un crédito ya tomado, el pago sale del contenedor del crédito con los mismos pasos que "Disponible".'
    ],
    puntos: [
      {
        titulo: 'El pago se abre en 3 taps, igual que hoy',
        pantalla: '"Inicio" → "$"',
        porque: '"Código QR" lleva a la cámara y "Envía" lleva a las llaves Bre-B. En el prototipo, "Toca para simular el escaneo" lee el QR de @tiendadonaluz.',
        estado: { screen: 'inicio', overlay: 'fab' }
      },
      {
        titulo: '"A quién" y "¿Cuánto?" van antes de "¿De dónde saldrá la plata?"',
        pantalla: '"Paga"',
        porque: 'Nequi necesita el valor y el negocio para evaluar el crédito. La consulta corre mientras se ve el cargador de 3 segundos. Los tiempos reales están por validar con el equipo técnico.',
        estado: { screen: 'paga', form: 'paga', origin: 'inicio', amount: '320000' },
        activaEn: [{ screen: 'llaves' }]
      },
      {
        titulo: '"Disponible" va primero y el crédito aparece solo con preaprobado',
        pantalla: '"¿De dónde saldrá la plata?"',
        porque: 'Con un preaprobado que cubre el pago, "Crédito preaprobado" aparece como segunda opción. Sin preaprobado, la persona ve solo "Disponible".',
        estado: { screen: 'origen', form: 'paga', origin: 'inicio', amount: '320000', source: 'credito', credit: false }
      },
      {
        titulo: 'La persona elige cuánto crédito toma',
        pantalla: '"Tienes un preaprobado"',
        porque: '"Sí, quiero todo", "Solo lo que necesito" u "Otro valor", con plazo y cuota a la vista. "Sí, quiero todo" va por defecto y es la primera decisión que se prueba con usuarios.',
        estado: { screen: 'credOpciones', form: 'paga', origin: 'inicio', amount: '320000', source: 'credito', credit: false },
        activaEn: [{ screen: 'credOpciones', overlay: 'plazo' }]
      },
      {
        titulo: 'Cuota, costo y condiciones se ven antes de aceptar',
        pantalla: '"Así quedará tu crédito"',
        porque: 'Cuota, fecha de pago, tasa, fianza, seguro y plazo en una sola pantalla, como el resumen que Nequi ya muestra al pedir un crédito.',
        estado: { screen: 'credResumen', form: 'paga', origin: 'inicio', amount: '320000', source: 'credito', credit: false }
      },
      {
        titulo: 'Contrato y verificación van antes del desembolso',
        pantalla: '"Este será nuestro contrato"',
        porque: 'La persona marca "He leído y acepto el contrato y el cobro de la fianza" y pasa por la verificación de identidad que la app ya usa. En el prototipo, "Toca para simular el reconocimiento" completa la verificación. La verificación fallida queda por diseñar.',
        estado: { screen: 'credContrato', form: 'paga', origin: 'inicio', amount: '320000', source: 'credito', credit: false }
      },
      {
        titulo: 'Lo que sobra del crédito queda en "Préstamos"',
        pantalla: '"¡Desembolso exitoso!"',
        porque: 'Con un crédito mayor que el pago, el sobrante va al contenedor del crédito: un espacio dentro de "Préstamos", con la etiqueta "crédito" y separado de "Disponible". El aviso dice cuánto se desembolsó y "Ir a Préstamos" lleva al contenedor del crédito.',
        estado: { screen: 'inicio', overlay: 'desembolso', form: 'paga', amount: '250000', source: 'credito', showBal: true }
      },
      {
        titulo: 'Los pagos siguientes salen del contenedor del crédito con los pasos de "Disponible"',
        pantalla: '¿De dónde saldrá la plata?',
        porque: 'El contenedor del crédito aparece debajo de "Disponible" con su saldo. Elegirlo lleva directo a "Confirma el envío". Si el pago supera su saldo, la opción aparece deshabilitada.',
        estado: { screen: 'origen', form: 'paga', origin: 'inicio', amount: '120000', source: 'contenedor' }
      }
    ]
  },
  {
    etiqueta: 'Movimientos',
    titulo: 'El contenedor del crédito concentra su historial',
    lineas: [
      'El pago sale como un gasto del contenedor del crédito, con el negocio y su detalle.',
      '"Movimientos" suma la pestaña "Créditos".',
      'El contenedor del crédito se puede renombrar y la etiqueta "crédito" se mantiene.'
    ],
    puntos: [
      {
        titulo: 'El contenedor del crédito muestra en qué se usó cada peso',
        pantalla: 'Contenedor del crédito',
        porque: 'Muestra el saldo, el nombre y los pagos hechos con él. La plata sale de él y no entra, y lo gastado no se repone. El lápiz de "Nombre del crédito" lo cambia y "Mover plata" pasa saldo a "Disponible".',
        estado: { screen: 'credito' },
        activaEn: [{ screen: 'credito', overlay: 'mover' }, { screen: 'credito', overlay: 'nombre' }]
      },
      {
        titulo: '"Movimientos" agrupa los pagos con crédito',
        pantalla: '"Movimientos"',
        porque: 'Cada pago con crédito lleva la etiqueta "crédito", y la pestaña "Créditos" los filtra. El mismo pago aparece también dentro del contenedor del crédito.',
        estado: { screen: 'movs', movTab: 'creditos' }
      }
    ]
  },
  {
    etiqueta: 'Abono',
    titulo: 'Abonar al crédito suma una cuarta opción a las que Nequi ya tiene',
    lineas: [
      'Hay dos accesos: el favorito "Créditos" en "Inicio" y "Ir a este crédito" en el contenedor del crédito.',
      'La pantalla del crédito muestra lo que se debe, las cuotas pagadas y un "Historial de pagos" solo con los pagos del crédito.',
      'Cada pago queda en ese historial y en "Movimientos".'
    ],
    puntos: [
      {
        titulo: 'La pantalla del crédito muestra lo que se debe y cada pago',
        pantalla: '"Créditos"',
        porque: '"Cuota mensual", "Debes", "Cuotas pagadas" y "Próximo pago" en una sola pantalla. "Pagar crédito" abre las opciones de pago.',
        estado: { screen: 'credPagos', pagoFrom: 'inicio' }
      },
      {
        titulo: 'Quien no alcanza la cuota tiene una cuarta opción de pago',
        pantalla: '"¿Qué quieres pagar?"',
        porque: '"Pago mínimo", "Pago total de la deuda" y "Otro valor" ya existen en Nequi. "Pago mínimo alternativo" alarga el plazo 12 meses y baja la cuota; aumenta el costo total y está por validar con otras áreas.',
        estado: { screen: 'quePagar', pagoFrom: 'inicio' }
      }
    ]
  }
];

// Lista plana para resaltar el paso activo; la numeración es continua entre secciones.
export const puntos = secciones.flatMap(s => s.puntos);
