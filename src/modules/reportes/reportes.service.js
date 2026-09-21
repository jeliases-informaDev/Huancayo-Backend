import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, ImageRun, WidthType, AlignmentType } from 'docx';
import prisma from '#core/config/prisma.js';

// Reproduce la estructura de PLANTILLAS FICHAS DE VISITA.docx (Consumo / Otros).
// Ojo: ese documento NO tiene ningún campo de foto — la evidencia fotográfica vive
// aparte, en el storage de evidencias, visible para el auditor de oficina desde el
// panel web (VisitaDetailPage). Este Word solo debe reproducir la ficha de texto.
const TABLE_WIDTH_DXA = 9000;
const HALF_WIDTH_DXA = TABLE_WIDTH_DXA / 2;
const NO_DISPONIBLE = 'No disponible';

const texto = (value, fallback = NO_DISPONIBLE) => (value === null || value === undefined || value === '' ? fallback : String(value));
const fechaHora = (date) => (date ? new Date(date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : NO_DISPONIBLE);
const soloFecha = (date) => (date ? new Date(date).toLocaleDateString('es-PE') : NO_DISPONIBLE);
const soloHora = (date) => (date ? new Date(date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : NO_DISPONIBLE);
const monto = (value, moneda) => (value === null || value === undefined ? NO_DISPONIBLE : `${moneda || ''} ${Number(value).toFixed(2)}`.trim());
const siNo = (value) => (value === true ? 'SI' : value === false ? 'NO' : NO_DISPONIBLE);

function titulo(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } });
}

function celda(text, { width = HALF_WIDTH_DXA, bold = false } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ children: [new TextRun({ text: texto(text, ''), bold })] })],
  });
}

// Tabla de 2 columnas "etiqueta: valor" — así están casi todas las secciones del
// formulario original (DATOS DEL CLIENTE / DATOS DEL NEGOCIO en paralelo, etc.).
function tablaDosColumnas(pares) {
  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [HALF_WIDTH_DXA, HALF_WIDTH_DXA],
    rows: pares.map(([izq, der]) => new TableRow({ children: [celda(izq), celda(der ?? '')] })),
  });
}

function tablaEncabezado(headers, filas, widths) {
  const anchoCol = widths || headers.map(() => Math.floor(TABLE_WIDTH_DXA / headers.length));
  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: anchoCol,
    rows: [
      new TableRow({ children: headers.map((h, i) => celda(h, { width: anchoCol[i], bold: true })) }),
      ...filas.map((fila) => new TableRow({ children: fila.map((v, i) => celda(v, { width: anchoCol[i] })) })),
    ],
  });
}

const ETIQUETAS_CUESTIONARIO = {
  donde_realiza_pagos: '¿Dónde realiza sus pagos?',
  conyuge_conoce_prestamo: '¿Cónyuge tiene conocimiento del préstamo?',
  entrego_dinero_asesor: '¿Alguna vez entregó dinero al asesor por alguna razón?',
  creditos_paralelos: '¿Tiene Ud. créditos paralelos?',
  pago_comision_adicional: '¿Ud. ha pagado alguna comisión adicional por el desembolso de su crédito?',
  recibio_monto_total: '¿Ud. ha recibido el total del monto solicitado?',
  comparte_dinero_credito: '¿Comparte el dinero del crédito con otra persona?',
  titular_administra_negocio: '¿Titular administra el negocio?',
  tiene_microseguro: '¿Ud. tiene microseguro?',
  recibio_info_microseguro: '¿Ud. recibió toda la información necesaria antes de comprar el microseguro?',
  conforme_microseguro: '¿Está conforme con el microseguro comprado?',
  comentario_microseguro: 'Comentario sobre el microseguro',
};

// --- Secciones compartidas por ambas variantes (Consumo / Otros) ---

function seccionEncabezado(expediente, visita) {
  return [
    new Paragraph({ text: 'FICHA DE ENTREVISTA', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: `PLANTILLA PARA CRÉDITOS ${expediente.tipo_credito}`, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    tablaEncabezado(
      ['UAI - CAJA HUANCAYO', 'AGENCIA/OF. ESP.', 'FECHA', 'HORA', 'VISITA N.º'],
      [[' ', texto(expediente.oficina), soloFecha(visita.fecha_hora_checkin), soloHora(visita.fecha_hora_checkin), String(visita.id_visita)]],
    ),
  ];
}

function seccionClienteYNegocio(expediente) {
  const c = expediente.datos_cliente || {};
  const n = expediente.datos_negocio || {};
  return [
    titulo('DATOS DEL CLIENTE / DATOS DEL NEGOCIO'),
    tablaDosColumnas([
      [`Fuente: ${texto(c.fuente)}`, ''],
      [`Fecha de Nac: ${texto(c.fecha_nacimiento)}   Edad: ${texto(c.edad)}`, `Actividad: ${texto(n.actividad)}`],
      [`Nombres y apellidos: ${texto(expediente.nombres_cliente)}`, `Estado del negocio: ${texto(n.estado_negocio)}`],
      [`Estado Civil: ${texto(c.estado_civil)}   ${expediente.tipo_documento_cliente}: ${texto(expediente.numero_documento_cliente)}`, `Antigüedad del negocio: ${texto(n.antiguedad_negocio)}`],
      [`Dirección del domicilio: ${texto(expediente.direccion_domicilio)}`, `Dirección del negocio/empleador: ${texto(n.direccion_negocio || n.empleador)}`],
      [`Distrito: ${texto(expediente.distrito)}   Provincia: ${texto(expediente.provincia)}   Departamento: ${texto(expediente.departamento)}`, `Referencia del negocio/empleador: ${texto(n.referencia)}`],
      [`Referencia del domicilio: ${texto(c.referencia_domicilio)}`, `Tipo de vivienda: ${texto(c.tipo_vivienda)}`],
      [`Teléfono y/o celular: ${texto(expediente.telefono_cliente)}`, `N° de suministro: ${texto(c.numero_suministro)}`],
    ]),
  ];
}

function seccionHistorialCrediticio() {
  // Estos campos provienen del sistema core de Caja Huancayo (historial de créditos,
  // aprobador, calificación SBS, etc.). Sin integración en vivo con ese sistema
  // (fase actual: carga por Excel), no hay una fuente confiable para completarlos.
  return [
    titulo('HISTORIAL CREDITICIO'),
    new Paragraph('No disponible — requiere integración en vivo con el sistema core de Caja Huancayo.'),
  ];
}

function seccionCreditoYParticipantes(expediente) {
  const cr = expediente.datos_credito || {};
  return [
    titulo('DATOS DEL CRÉDITO Y PARTICIPANTES'),
    tablaDosColumnas([
      [`Asesor solicitud: ${texto(cr.asesor_solicitud)}`, `Cónyuge: ${texto(cr.conyuge)}`],
      [`Asesor responsable: ${texto(expediente.asesor_responsable)}`, `Aval: ${texto(cr.aval)}`],
      [`Producto: ${texto(cr.producto)}`, `Rep. Legal: ${texto(cr.rep_legal)}`],
      [`Monto desembolsado: ${monto(expediente.monto_desembolso, expediente.moneda)}`, `Estado: ${texto(cr.estado)}`],
      [`Fecha de vencimiento: ${texto(cr.fecha_vencimiento)}`, `Calificación SBS: ${texto(cr.calificacion_sbs)}`],
    ]),
  ];
}

function seccionEvaluacionFinancieraConsumo(evaluacion) {
  const ingresos = evaluacion?.ingresos || [];
  return [
    titulo('DATOS DE LA EVALUACIÓN FINANCIERA'),
    new Paragraph('Ingresos registrados en la evaluación.'),
    ingresos.length
      ? tablaEncabezado(
          ['Descripción', 'Relación', 'Moneda', 'Monto', 'Tipo de ingreso'],
          ingresos.map((i) => [texto(i.descripcion), texto(i.relacion), texto(i.moneda), texto(i.monto), texto(i.tipo_ingreso)]),
        )
      : new Paragraph(NO_DISPONIBLE),
  ];
}

function seccionEvaluacionFinancieraOtros(evaluacion) {
  const bg = evaluacion?.balance_general || {};
  const er = evaluacion?.estado_resultados || {};
  return [
    titulo('DATOS DE LA EVALUACIÓN FINANCIERA'),
    new Paragraph('Análisis del informe de reevaluación de la Unidad Económica / Negocio.'),
    tablaEncabezado(
      ['BALANCE GENERAL', 'Monto'],
      [
        ['Activo corriente', monto(bg.activo_corriente)],
        ['Pasivo corriente', monto(bg.pasivo_corriente)],
        ['Patrimonio', monto(bg.patrimonio)],
      ],
    ),
    new Paragraph({ text: '', spacing: { before: 120 } }),
    tablaEncabezado(
      ['ESTADO DE RESULTADOS', 'Monto'],
      [
        ['Ventas netas', monto(er.ventas_netas)],
        ['Costo de mercadería / producción', monto(er.costo_mercaderia)],
        ['Utilidad bruta', monto(er.utilidad_bruta)],
        ['Gastos operativos', monto(er.gastos_operativos)],
        ['Utilidad operativa', monto(er.utilidad_operativa)],
      ],
    ),
  ];
}

function seccionEndeudamiento(endeudamiento) {
  const entidades = endeudamiento?.entidades || [];
  const conyuge = endeudamiento?.entidades_conyuge || [];
  const filas = (lista) => lista.map((e) => [texto(e.entidad), monto(e.saldo), texto(e.calificacion), texto(e.tipo_credito)]);
  const children = [
    titulo('INFORMACIÓN SOBRE ENDEUDAMIENTO DEL CLIENTE Y CÓNYUGE'),
    entidades.length
      ? tablaEncabezado(['ENTIDAD', 'SALDO S/', 'CALIFICACIÓN', 'TIPO DE CRÉDITO'], filas(entidades))
      : new Paragraph(NO_DISPONIBLE),
  ];
  if (conyuge.length) {
    children.push(new Paragraph({ text: 'CÓNYUGE', spacing: { before: 120 } }));
    children.push(tablaEncabezado(['ENTIDAD', 'SALDO S/', 'CALIFICACIÓN', 'TIPO DE CRÉDITO'], filas(conyuge)));
  }
  return children;
}

function seccionComentarioNegocio(comentario) {
  return [
    titulo('INFORMACIÓN DEL CLIENTE Y NEGOCIO'),
    new Paragraph(`Comentario general del negocio: ${texto(comentario)}`),
  ];
}

function seccionCuestionario(respuestas) {
  const items = Object.entries(respuestas || {}).map(([key, value]) => {
    const etiqueta = ETIQUETAS_CUESTIONARIO[key] || key;
    const valor = typeof value === 'boolean' ? siNo(value) : texto(value);
    return [etiqueta, valor];
  });
  return [
    titulo('CUESTIONARIO AL CLIENTE'),
    items.length ? tablaDosColumnas(items) : new Paragraph(NO_DISPONIBLE),
  ];
}

function seccionOtrosClientesDomicilio(lista) {
  const filas = lista || [];
  return [
    titulo('OTROS CLIENTES QUE DOMICILIAN EN LA VIVIENDA'),
    filas.length
      ? tablaEncabezado(
          ['Nombre del cliente', 'Parentesco', 'Actividad', 'Antigüedad del negocio'],
          filas.map((f) => [texto(f.nombre), texto(f.parentesco), texto(f.actividad), texto(f.antiguedad_negocio)]),
        )
      : new Paragraph(NO_DISPONIBLE),
  ];
}

function seccionOtrosIngresos(lista) {
  const filas = lista || [];
  return [
    titulo('OTROS INGRESOS (SI LOS TUVIERA)'),
    filas.length
      ? tablaEncabezado(['Origen', 'Monto mensual'], filas.map((f) => [texto(f.origen), monto(f.monto_mensual)]))
      : new Paragraph(NO_DISPONIBLE),
  ];
}

function seccionComentariosFinales(comentario) {
  return [titulo('COMENTARIOS FINALES DEL AUDITOR'), new Paragraph(texto(comentario))];
}

function seccionFirmas(expediente, firmaDataUrl) {
  const children = [titulo('FIRMAS')];
  if (firmaDataUrl && firmaDataUrl.startsWith('data:image/png;base64,')) {
    const buffer = Buffer.from(firmaDataUrl.split(',')[1], 'base64');
    children.push(new Paragraph({ children: [new ImageRun({ data: buffer, type: 'png', transformation: { width: 220, height: 110 } })] }));
  }
  children.push(tablaDosColumnas([
    ['FIRMA DEL CLIENTE', 'FIRMA Y SELLO DEL VERIFICADOR'],
    [`N° DE DNI: ${texto(expediente.numero_documento_cliente)}`, ''],
  ]));
  return children;
}

async function generarWordVisita(idVisita) {
  const visita = await prisma.visitaAuditoria.findUnique({
    where: { id_visita: idVisita },
    include: { expediente: true, auditor: true },
  });
  if (!visita) throw Object.assign(new Error('Visita no encontrada'), { statusCode: 404 });

  const expediente = visita.expediente;
  const esConsumo = expediente.tipo_credito === 'CONSUMO';

  const children = [
    ...seccionEncabezado(expediente, visita),
    ...seccionClienteYNegocio(expediente),
    ...seccionHistorialCrediticio(),
    ...seccionCreditoYParticipantes(expediente),
    ...(esConsumo
      ? seccionEvaluacionFinancieraConsumo(expediente.evaluacion_financiera)
      : seccionEvaluacionFinancieraOtros(expediente.evaluacion_financiera)),
    ...seccionEndeudamiento(expediente.endeudamiento),
    ...seccionComentarioNegocio(visita.comentario_negocio),
    ...seccionCuestionario(visita.respuestas_cuestionario),
    ...seccionOtrosClientesDomicilio(visita.otros_clientes_domicilio),
    ...seccionOtrosIngresos(visita.otros_ingresos),
    ...seccionComentariosFinales(visita.comentario_auditor),
    ...seccionFirmas(expediente, visita.firma_evidencia),
    new Paragraph({
      text: `Auditor: ${`${visita.auditor.nombres || ''} ${visita.auditor.apellidos || ''}`.trim() || visita.auditor.username} · Visita registrada ${fechaHora(visita.server_received_at)} · Resultado: ${visita.resultado}`,
      spacing: { before: 300 },
    }),
    new Paragraph({
      text: 'La evidencia fotográfica de esta visita no se incluye en este documento: está disponible en el panel de Auditoría de Visitas (Visitas → esta visita → Evidencias).',
      spacing: { before: 120 },
    }),
  ];

  const documento = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBuffer(documento);
}

export default { generarWordVisita };
