// Recorrido del prototipo por momentos: Pago → Movimientos → Abono (Contexto/nequi-presentacion-texto.md).
// Cada sección tiene un título, un botón opcional para empezar su flujo (`inicio`) y sus pasos.
// Los pasos no navegan: se abren solos cuando el teléfono muestra una de sus pantallas (`activaEn`:
// pantalla y capa). `contenedor` distingue los dos pasos de "¿De dónde saldrá la plata?": sin y con
// contenedor del crédito.
export const secciones = [
  {
    etiqueta: 'Pago',
    titulo: 'Pagar con un crédito nuevo',
    // Botón que lleva el teléfono al inicio del flujo; sin crédito tomado, para que aparezca el preaprobado
    inicio: { texto: 'Empezar flujo', estado: { screen: 'breb', origin: 'inicio', credit: false } },
    puntos: [
      {
        titulo: '"A quién" y "¿Cuánto?" van antes de "¿De dónde saldrá la plata?"',
        pantalla: '"Paga" · "¿A quién le vas a enviar plata?"',
        porque: 'Nequi necesita el valor y el negocio para evaluar el crédito. La consulta corre mientras se ve el cargador de 3 segundos. Los tiempos reales están por validar con el equipo técnico.',
        activaEn: [{ screen: 'paga' }, { screen: 'llaves' }]
      },
      {
        titulo: 'Alternativas para realizar pago en el negocio',
        pantalla: '"¿De dónde saldrá la plata?"',
        porque: '"Disponible" siempre aparece como primera opción. La opción de crédito solo se muestra cuando el usuario tiene un crédito preaprobado. Personas sin preaprobado o con evaluación no favorable solo ven "Disponible".',
        activaEn: [{ screen: 'origen', contenedor: false }]
      },
      {
        titulo: 'La persona elige cuánto crédito toma',
        pantalla: '"Tienes un preaprobado"',
        porque: 'Se presentan tres opciones: "Sí, quiero todo", "Solo lo que necesito" y "Otro valor". Además, la persona puede elegir el número de cuotas y consultar si el negocio ofrece pagos sin intereses para determinados plazos.',
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
        titulo: 'Al realizar un nuevo pago el contenedor del crédito sale como opción para hacer un pago',
        pantalla: '¿De dónde saldrá la plata?',
        porque: 'El contenedor del crédito aparece debajo de "Disponible" con su saldo. Elegirlo lleva directo a "Confirma el envío". Si el pago supera su saldo, la opción aparece deshabilitada.',
        activaEn: [{ screen: 'origen', contenedor: true }]
      }
    ]
  },
  {
    etiqueta: 'Movimientos',
    titulo: 'El contenedor del crédito concentra su historial',
    puntos: [
      {
        titulo: 'El contenedor del crédito aparece disponible en "Tus Préstamos" y muestra en qué se usó cada peso',
        pantalla: '"Tus Préstamos" · Contenedor del crédito',
        porque: 'Cada contenedor tiene un tag de "crédito". Al ingresar se muestra el saldo, el nombre y los pagos hechos con él. La plata sale de él, pero no entra, y lo gastado no se repone. Desde "Mover plata" pasa saldo a "Disponible".',
        activaEn: [{ screen: 'creditos' }, { screen: 'credito' }, { screen: 'credito', overlay: 'mover' }, { screen: 'credito', overlay: 'nombre' }]
      },
      {
        titulo: 'Ahora en la sección de "Movimientos" se agrupan los pagos con crédito',
        pantalla: '"Movimientos"',
        porque: 'Cada pago con crédito lleva la etiqueta "crédito", y la tab de "Créditos" los filtra.',
        activaEn: [{ screen: 'movs' }]
      }
    ]
  },
  {
    etiqueta: 'Abono',
    titulo: 'Abonar al crédito suma una cuarta opción a las que Nequi ya tiene',
    puntos: [
      {
        titulo: 'La pantalla del crédito muestra lo que se debe y cada pago',
        pantalla: '"Créditos"',
        porque: '"Cuota mensual", "Debes", "Cuotas pagadas" y "Próximo pago" en una sola pantalla. "Pagar crédito" abre las opciones de pago.',
        activaEn: [{ screen: 'credPagos' }]
      },
      {
        titulo: 'Quien no alcanza la cuota tiene una cuarta opción de pago',
        pantalla: '"¿Qué quieres pagar?"',
        porque: '"Pago mínimo", "Pago total de la deuda" y "Otro valor" ya existen en Nequi. "Pago mínimo alternativo" alarga el plazo 12 meses* y baja la cuota; aumenta el costo total.',
        nota: '*Por validar con otras áreas.',
        activaEn: [{ screen: 'quePagar' }]
      }
    ]
  }
];

// Lista plana para abrir el paso activo; la numeración es continua entre secciones.
export const puntos = secciones.flatMap(s => s.puntos);
