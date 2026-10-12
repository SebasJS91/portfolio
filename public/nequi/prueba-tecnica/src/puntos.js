// Recorrido del prototipo por momentos: Pago → Movimientos → Abono (Contexto/nequi-presentacion-texto.md).
// Cada sección tiene un título que ya es la conclusión, hasta 4 líneas y sus pasos.
// Los pasos no navegan: se abren solos cuando el teléfono muestra una de sus pantallas (`activaEn`:
// pantalla y capa). `contenedor` distingue los dos pasos de "¿De dónde saldrá la plata?": sin y con
// contenedor del crédito.
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
        activaEn: [{ screen: 'inicio', overlay: 'fab' }, { screen: 'inicio', overlay: 'qr' }, { screen: 'inicio', overlay: 'enviar' }, { screen: 'scan' }, { screen: 'breb' }]
      },
      {
        titulo: '"A quién" y "¿Cuánto?" van antes de "¿De dónde saldrá la plata?"',
        pantalla: '"Paga"',
        porque: 'Nequi necesita el valor y el negocio para evaluar el crédito. La consulta corre mientras se ve el cargador de 3 segundos. Los tiempos reales están por validar con el equipo técnico.',
        activaEn: [{ screen: 'paga' }, { screen: 'llaves' }]
      },
      {
        titulo: '"Disponible" va primero y el crédito aparece solo con preaprobado',
        pantalla: '"¿De dónde saldrá la plata?"',
        porque: 'Con un preaprobado que cubre el pago, "Crédito preaprobado" aparece como segunda opción. Sin preaprobado, la persona ve solo "Disponible".',
        activaEn: [{ screen: 'origen', contenedor: false }]
      },
      {
        titulo: 'La persona elige cuánto crédito toma',
        pantalla: '"Tienes un preaprobado"',
        porque: '"Sí, quiero todo", "Solo lo que necesito" u "Otro valor", con plazo y cuota a la vista. "Sí, quiero todo" va por defecto y es la primera decisión que se prueba con usuarios.',
        activaEn: [{ screen: 'credOpciones' }, { screen: 'credOpciones', overlay: 'plazo' }]
      },
      {
        titulo: 'Cuota, costo y condiciones se ven antes de aceptar',
        pantalla: '"Así quedará tu crédito"',
        porque: 'Cuota, fecha de pago, tasa, fianza, seguro y plazo en una sola pantalla, como el resumen que Nequi ya muestra al pedir un crédito.',
        activaEn: [{ screen: 'credResumen' }]
      },
      {
        titulo: 'Contrato y verificación van antes del desembolso',
        pantalla: '"Este será nuestro contrato"',
        porque: 'La persona marca "He leído y acepto el contrato y el cobro de la fianza" y pasa por la verificación de identidad que la app ya usa. En el prototipo, "Toca para simular el reconocimiento" completa la verificación. La verificación fallida queda por diseñar.',
        activaEn: [{ screen: 'credContrato' }, { screen: 'credValida' }, { screen: 'credFacial' }]
      },
      {
        titulo: 'Lo que sobra del crédito queda en "Préstamos"',
        pantalla: '"¡Desembolso exitoso!"',
        porque: 'Con un crédito mayor que el pago, el sobrante va al contenedor del crédito: un espacio dentro de "Préstamos", con la etiqueta "crédito" y separado de "Disponible". El aviso dice cuánto se desembolsó y "Ir a Préstamos" lleva al contenedor del crédito.',
        activaEn: [{ screen: 'inicio', overlay: 'desembolso' }]
      },
      {
        titulo: 'Los pagos siguientes salen del contenedor del crédito con los pasos de "Disponible"',
        pantalla: '¿De dónde saldrá la plata?',
        porque: 'El contenedor del crédito aparece debajo de "Disponible" con su saldo. Elegirlo lleva directo a "Confirma el envío". Si el pago supera su saldo, la opción aparece deshabilitada.',
        activaEn: [{ screen: 'origen', contenedor: true }]
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
        activaEn: [{ screen: 'credito' }, { screen: 'credito', overlay: 'mover' }, { screen: 'credito', overlay: 'nombre' }, { screen: 'creditos' }]
      },
      {
        titulo: '"Movimientos" agrupa los pagos con crédito',
        pantalla: '"Movimientos"',
        porque: 'Cada pago con crédito lleva la etiqueta "crédito", y la pestaña "Créditos" los filtra. El mismo pago aparece también dentro del contenedor del crédito.',
        activaEn: [{ screen: 'movs' }]
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
        activaEn: [{ screen: 'credPagos' }, { screen: 'credDetalles' }]
      },
      {
        titulo: 'Quien no alcanza la cuota tiene una cuarta opción de pago',
        pantalla: '"¿Qué quieres pagar?"',
        porque: '"Pago mínimo", "Pago total de la deuda" y "Otro valor" ya existen en Nequi. "Pago mínimo alternativo" alarga el plazo 12 meses y baja la cuota; aumenta el costo total y está por validar con otras áreas.',
        activaEn: [{ screen: 'quePagar' }]
      }
    ]
  }
];

// Lista plana para abrir el paso activo; la numeración es continua entre secciones.
export const puntos = secciones.flatMap(s => s.puntos);
