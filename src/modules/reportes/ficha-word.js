import {
  Document, Paragraph, Table, TableRow, TableCell, TextRun, ImageRun, WidthType, AlignmentType,
  ShadingType, VerticalAlign, Footer, PageNumber, TableLayoutType,
} from 'docx';

// Ficha de entrevista en Word: solo el armado del documento (sin base de datos), para poder probarlo aparte.
// Reproduce los formatos físicos de Caja Huancayo:
//   · MYPE (créditos "OTROS"): la ficha de 13 secciones de la base real (historial, ingresos
//     con días buenos/malos/estándar, balance y resultados comparativos con conformidad...).
//   · CONSUMO: la ficha reducida (datos laborales, ingresos del cliente, sin balance).
// Los datos de la base salen del "snapshot" guardado al cerrar la visita (lo que el auditor
// vio), no del expediente actual: así una reimportación posterior no altera la ficha cerrada.
// La evidencia fotográfica NO va en este documento: se consulta en el panel (Visitas → Evidencias).

const ANCHO = 10206; // A4 con márgenes de 1,5 cm, en DXA
const FS = 15; // 7,5 pt (medios puntos)
const FONT = 'Arial';
const GRIS = 'E7ECF4';
const AZUL = 'D5E0F3';

// ---------- formato de valores ----------
const vacio = (v) => v === null || v === undefined || v === '';
const val = (v, alt = '-') => (vacio(v) ? alt : String(v));
const n2 = (v) => (vacio(v) || Number.isNaN(Number(v)) ? '-' : Number(v).toFixed(2));
const entero = (v) => (vacio(v) || Number.isNaN(Number(v)) ? '-' : String(Math.round(Number(v))));
const dmy = (iso) => {
  if (vacio(iso)) return '-';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(iso);
};
const soloFecha = (d) => (d ? new Date(d).toLocaleDateString('es-PE') : '-');
const soloHora = (d) => (d ? new Date(d).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-');
const fechaHora = (d) => (d ? new Date(d).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '-');
const casilla = (marcada) => (marcada ? '[X]' : '[  ]');
const siNo = (v) => `SI (${v === true ? 'X' : '  '})   NO (${v === false ? 'X' : '  '})`;

// La antigüedad se imprime como la trae la base ("9 AÑOS", "120"), igual que el formato del banco; si solo hay meses calculados, en meses.
const antiguedadDe = (n = {}) => (n.antiguedad_texto ? val(n.antiguedad_texto) : n.antiguedad_meses != null ? `${n.antiguedad_meses} meses` : '-');
const telefonosDe = (e, c = {}) => [c.telefono_fijo, c.telefono_celular].filter(Boolean).join(' - ') || val(e.telefono_cliente);
// Los locales del negocio (o los empleadores, en Consumo) vienen como lista de hasta dos: cada dato se separa con " / ", como en el formato del banco.
const deNegocios = (negocios, clave) => (negocios || []).map((x) => val(x?.[clave], '')).filter(Boolean).join(' / ');
const casillasNegocio = (estado) => `En funcionamiento: ${casilla(estado === 'EN_FUNCIONAMIENTO')}    Inoperativo: ${casilla(estado === 'INOPERATIVO')}    De terceros: ${casilla(estado === 'DE_TERCEROS')}`;
const monedaTexto = (ev) => (ev?.moneda === 'USD' ? 'DÓLARES' : 'SOLES');

// ---------- bloques de bajo nivel ----------
function parrafo(text, { bold = false, size = FS, align, before = 0, after = 0, italics = false, keepNext = false } = {}) {
  return new Paragraph({
    alignment: align,
    keepNext: keepNext || undefined, // solo se escribe cuando es verdadero
    spacing: { before, after },
    children: [new TextRun({ text: String(text ?? ''), bold, italics, size, font: FONT })],
  });
}

// Una celda se describe aquí y la arma tabla(): así sabe si su fila va pegada a la siguiente (todas menos la última) y la tabla entera, con su título,
// no se parte entre dos hojas (Word la pasa completa a la hoja siguiente; si una tabla fuera más alta que la hoja, la parte igual).
function celda(contenido, opciones = {}) {
  return { contenido, opciones };
}

function armarCelda({ contenido, opciones: { w, span, rowSpan, bold = false, fill, size = FS, align, valign = VerticalAlign.CENTER } }, pegada) {
  const lineas = Array.isArray(contenido) ? contenido : String(contenido ?? '').split('\n');
  return new TableCell({
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    columnSpan: span,
    rowSpan,
    verticalAlign: valign,
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 30, bottom: 30, left: 60, right: 60 },
    children: lineas.map((linea) => (typeof linea === 'string' ? parrafo(linea, { bold, size, align, keepNext: pegada }) : linea)),
  });
}

// Las tablas cortas (hasta MAX_FILAS_JUNTAS filas) se mantienen enteras; una larga, como el balance, puede partirse entre filas (una fila nunca se parte).
const MAX_FILAS_JUNTAS = 10;

function tabla(anchos, filas) {
  const juntas = filas.length <= MAX_FILAS_JUNTAS;
  return new Table({
    width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: anchos,
    layout: TableLayoutType.FIXED, // respeta los anchos: sin esto Word reparte las columnas y la tabla se sale de la hoja
    rows: filas.map((celdas, i) => new TableRow({ cantSplit: true, children: celdas.map((c) => armarCelda(c, juntas && i < filas.length - 1)) })),
  });
}

function titulo(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 140, after: 50 },
    shading: { type: ShadingType.CLEAR, fill: AZUL, color: 'auto' },
    children: [new TextRun({ text, bold: true, size: 17, font: FONT })],
  });
}

const nota = (text) => parrafo(text, { italics: true, size: 14, before: 20, after: 20, keepNext: true });
const espacio = (after = 60) => parrafo('', { after, keepNext: true });
// Párrafo de 1 punto que va después de cada tabla: no lleva keepNext, así la tabla se queda con su título pero no arrastra a la siguiente sección.
const separador = () => new Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: 'exact' }, run: { size: 2 }, children: [] });

// Tabla de dos columnas "etiqueta/valor" lado a lado: cada fila = [izquierda, derecha].
function tablaPares(filas) {
  const mitad = ANCHO / 2;
  return tabla([mitad, mitad], filas.map(([izq, der]) => (der === undefined
    ? [celda(izq, { w: ANCHO, span: 2 })]
    : [celda(izq, { w: mitad }), celda(der, { w: mitad })])));
}

// ---------- cabecera ----------
function seccionEncabezado(e, visita, plantilla, empresa) {
  const sub = plantilla === 'MYPE_V1' ? 'FICHA DE ENTREVISTA — CRÉDITOS MYPE (OTROS)' : 'FICHA DE ENTREVISTA — CRÉDITOS DE CONSUMO';
  const a = [2900, 3100, 1000, 1000, 2206];
  return [
    parrafo(sub, { bold: true, size: 22, align: AlignmentType.CENTER, after: 80 }),
    tabla(a, [[
      celda(`UAI - ${String(empresa?.nombre_corto || empresa?.nombre || '').toUpperCase()}`, { w: a[0], bold: true, fill: GRIS }),
      celda(`AGENCIA/OF. ESP.: ${val(e.oficina)}`, { w: a[1] }),
      celda(`FECHA\n${soloFecha(visita.fecha_hora_checkin)}`, { w: a[2] }),
      celda(`HORA\n${soloHora(visita.fecha_hora_checkin)}`, { w: a[3] }),
      celda(`VISITA N.º ${visita.id_visita}`, { w: a[4], bold: true }),
    ]]),
  ];
}

// ---------- MYPE ----------
function seccionClienteNegocioMype(e, visita) {
  const c = e.datos_cliente || {};
  const n = e.datos_negocio || {};
  const negocios = n.negocios || [];
  return [
    titulo('DATOS DEL CLIENTE / DATOS DEL NEGOCIO'),
    tablaPares([
      [`Fuente: ${val(c.fuente)}`],
      [`Fecha de Nac.: ${dmy(c.fecha_nacimiento)}      Edad: ${val(c.edad)}`, `Actividad: ${val(n.actividad)}`],
      [`Nombres y apellidos: ${val(e.nombres_cliente)}`, casillasNegocio(visita.estado_negocio)],
      [`Estado civil: ${val(c.estado_civil)}      ${e.tipo_documento_cliente === 'RUC' ? 'RUC' : 'DNI/RUC'}: ${val(e.numero_documento_cliente)}`, `Antigüedad del negocio: ${antiguedadDe(n)}`],
      [`Dirección del domicilio: ${val(e.direccion_domicilio)}`, `Dirección del negocio: ${val(deNegocios(negocios, 'direccion'))}`],
      [`Distrito: ${val(e.distrito)}      Provincia: ${val(e.provincia)}      Dpto.: ${val(e.departamento)}`, `Referencia: ${val(deNegocios(negocios, 'referencia'))}`],
      [`Tipo de vivienda: ${val(c.tipo_vivienda)}      N.º de suministro: ${val(c.numero_suministro)}`, `Propiedad de local: ${val(visita.propiedad_local ? { PROPIO: 'Propio', ALQUILADO: 'Alquilado', FAMILIAR: 'Familiar', OTRO: 'Otro' }[visita.propiedad_local] : null, '')}`],
      [`Referencia del domicilio: ${val(c.referencia_domicilio)}`, `Tipo de cliente: ${val(c.tipo_cliente)}`],
      [`Teléfono y/o celular: ${telefonosDe(e, c)}`, `Distrito: ${val(deNegocios(negocios, 'distrito'))}      Teléfono y/o celular: ${val(deNegocios(negocios, 'telefono'))}`],
    ]),
  ];
}

function seccionHistorialMype(e) {
  const filas = e.datos_credito?.historial || [];
  const corte = e.endeudamiento?.fecha_corte;
  const a = [850, 700, 760, 760, 380, 850, 1350, 560, 760, 800, 760, 1100, 576];
  const cab = ['LÍNEA DE CRÉDITO', 'TIPO DE CRÉDITO', 'FECHA DE DESEMB.', 'MONTO DEL DESEMB.', 'MON.', 'SOLICITUD', 'N.º DE CRÉDITO', 'PLAZO Y FREC.', 'MONTO DE LA CUOTA', 'CONDICIÓN CONTABLE', corte ? `SALDO DE CAPITAL AL ${dmy(corte)}` : 'SALDO AL CORTE', 'ASESOR RESPONSABLE', 'CUOTA MÁS ATRASADA'];
  return [
    titulo('HISTORIAL CREDITICIO'),
    tabla(a, [
      cab.map((t, i) => celda(t, { w: a[i], bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER })),
      ...(filas.length ? filas : [{}]).map((f) => [
        val(f.linea), val(f.tipo), dmy(f.fecha_desembolso), n2(f.monto), val(f.moneda === 'USD' ? 'US$' : f.moneda ? 'S/' : null), val(f.solicitud),
        val(f.numero_credito), val(f.plazo_cuotas), n2(f.cuota), val(f.condicion), n2(f.saldo), val(f.asesor), val(f.cuota_mas_atrasada),
      ].map((t, i) => celda(t, { w: a[i], size: 13, align: i === 3 || i === 8 || i === 10 ? AlignmentType.RIGHT : AlignmentType.CENTER }))),
    ]),
  ];
}

function seccionCreditoYParticipantes(e) {
  const cr = e.datos_credito || {};
  const apr = cr.nivel_aprobador || {};
  const nivel = [apr.nombre, apr.cargo].filter(Boolean).join(' - ');
  return [
    titulo('DATOS DEL CRÉDITO Y PARTICIPANTES'),
    tablaPares([
      [`Asesor solicitud: ${val(cr.asesor_solicitud)}`, `Cónyuge: ${val(cr.conyuge)}`],
      [`Nivel aprobador: ${val(nivel)}`, `Aval: ${val(cr.aval)}`],
      [`Producto: ${val(cr.producto)}`, `Rep. legal: ${val(cr.rep_legal)}`],
      [`Fecha de vencimiento: ${dmy(cr.fecha_vencimiento)}      Estado: ${val(cr.estado)}`, `Monto de la cuota: ${n2(cr.monto_cuota)}`],
      [`Fecha últ. pago: ${dmy(cr.fecha_ultimo_pago)}`, `Destino: ${val(cr.destino)}`],
      [`Asesor responsable a la fecha: ${val(e.asesor_responsable)}`, `Calificación SBS: ${val(cr.calificacion_sbs)}      N.º de entidades: ${val(cr.numero_entidades)}`],
      [`Código de cliente: ${val(e.datos_cliente?.codigo_cliente)}`, `Días de atraso: ${val(cr.dias_atraso)}      Saldo capital: ${n2(cr.saldo_capital ?? cr.saldo_capital_soles)}`],
    ]),
  ];
}

function seccionIngresosMype(ev, conformidad) {
  const lineas = ev?.ingresos || [];
  const a = [1996, 500, 650, 450, 650, 450, 700, 450, 780, 780, 900, 900, 1000];
  const h = (t, i, extra = {}) => celda(t, { w: a[i], bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER, ...extra });
  const cab1 = [
    h('Descripción', 0, { rowSpan: 2 }), h('FREC. VECES AL MES', 1, { rowSpan: 2 }),
    celda('DÍAS BUENOS', { w: a[2] + a[3], span: 2, bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER }),
    celda('DÍAS MALOS', { w: a[4] + a[5], span: 2, bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER }),
    celda('DÍAS ESTÁNDAR', { w: a[6] + a[7], span: 2, bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER }),
    h('PRECIO DE COMPRA/PRODUC.', 8, { rowSpan: 2 }), h('PRECIO DE VENTA', 9, { rowSpan: 2 }), h('TOTAL MERCADERÍAS', 10, { rowSpan: 2 }),
    h('TOTAL COMPRAS/PRODUC.', 11, { rowSpan: 2 }), h('TOTAL VENTAS', 12, { rowSpan: 2 }),
  ];
  const cab2 = ['CANT', 'DÍAS', 'CANT', 'DÍAS', 'CANT', 'DÍAS'].map((t, i) => h(t, i + 2));
  const cuerpo = (lineas.length ? lineas : [{}]).map((l) => [
    val(l.descripcion), n2(l.frecuencia), n2(l.dias_buenos?.cantidad), entero(l.dias_buenos?.dias), n2(l.dias_malos?.cantidad), entero(l.dias_malos?.dias),
    n2(l.dias_estandar?.cantidad), entero(l.dias_estandar?.dias), n2(l.precio_compra), n2(l.precio_venta), n2(l.total_mercaderias), n2(l.total_compras), n2(l.total_ventas),
  ].map((t, i) => celda(t, { w: a[i], size: 13, align: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT })));
  const bloques = [
    titulo('DATOS DE LA EVALUACIÓN FINANCIERA'),
    parrafo('Ingresos registrados en la evaluación financiera.', { size: 14, after: 30 }),
    tabla(a, [cab1, cab2, ...cuerpo]),
  ];
  if (conformidad?.ingresos) bloques.push(parrafo(`Análisis / conformidad (ingresos): ${textoConformidad(conformidad.ingresos)}`, { size: 14, before: 30 }));
  return bloques;
}

function textoConformidad(bloque) {
  if (!bloque) return '-';
  return bloque.conforme ? 'CONFORME' : `OBSERVADO — ${val(bloque.comentario, 'sin detalle')}`;
}

const FILAS_BALANCE = [
  ['A.- ACTIVO', null, true], ['ACTIVO CORRIENTE', 'activo_corriente', true], ['    Disponibles', 'disponibles'], ['    Cuentas por cobrar', 'cuentas_por_cobrar'],
  ['    Otras ctas. por cobrar', 'otras_cuentas_por_cobrar'], ['    Adelanto a proveedores', 'adelanto_proveedores'], ['    Existencias', 'existencias'],
  ['ACTIVO NO CORRIENTE (Act. fijo)', 'activo_no_corriente', true], ['TOTAL ACTIVO', 'total_activo', true], ['B.- PASIVO', null, true],
  ['PASIVO CORRIENTE', 'pasivo_corriente', true], ['    Proveedores', 'proveedores'], ['    Otras ctas. por pagar', 'otras_cuentas_por_pagar'],
  ['    Préstamos corto plazo', 'prestamos_corto_plazo'], ['PASIVO NO CORRIENTE (Préstamos L/P)', 'pasivo_no_corriente', true], ['TOTAL PASIVO', 'total_pasivo', true],
  ['C.- PATRIMONIO', null, true], ['PATRIMONIO', 'patrimonio', true], ['TOTAL PASIVO + PATRIMONIO', 'total_pasivo_patrimonio', true],
];
const FILAS_RESULTADOS = [
  ['VENTAS NETAS', 'ventas_netas', true], ['Costo de mercaderías y/o producción', 'costo_ventas'], ['UTILIDAD BRUTA – MARGEN BRUTO', 'utilidad_bruta', true],
  ['Gastos operativos del negocio', 'gastos_operativos'], ['UTILIDAD OPERATIVA', 'utilidad_operativa', true], ['Obligaciones del negocio (cuotas)', 'obligaciones_negocio'],
  ['UTILIDAD NETA DEL NEGOCIO', 'utilidad_neta', true], ['Otros ingresos unidad econ. familiar', 'otros_ingresos_uef'], ['Obligaciones de la unidad familiar (cuotas)', 'obligaciones_uef'],
  ['Gastos familiares', 'gastos_familiares'], ['RESULTADO UNIDAD ECON. FAMILIAR', 'resultado_uef', true], ['CAPACIDAD DE PAGO', 'capacidad_pago', true], ['    % del resultado U.E.F. aplicado', 'porcentaje_capacidad'], ['', null], ['', null], ['', null], ['', null], ['', null], ['', null],
];

function seccionBalanceResultados(ev, conformidad) {
  const re = ev?.reevaluacion;
  const an = ev?.anterior;
  const moneda = monedaTexto(ev);
  const a = [2300, 880, 880, 1043, 2300, 880, 880, 1043]; // 10206
  const cabEval = (x) => (x ? `${val(x.numero_evaluacion)}\n${dmy(x.fecha)}` : 'Sin evaluación');
  const h = (t, i) => celda(t, { w: a[i], bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER });
  const total = FILAS_BALANCE.length;
  const mostrar = (periodo, bloque, clave) => (periodo && clave ? n2(periodo[bloque]?.[clave]) : '');
  const conf = (bloque) => textoConformidad(conformidad?.[bloque]);
  const filas = [
    [celda(`BALANCE GENERAL EXPRESADO EN ${moneda}`, { w: a[0] + a[1] + a[2] + a[3], span: 4, bold: true, fill: AZUL, size: 13, align: AlignmentType.CENTER }),
      celda(`ESTADO DE RESULTADOS EXPRESADO EN ${moneda}`, { w: a[4] + a[5] + a[6] + a[7], span: 4, bold: true, fill: AZUL, size: 13, align: AlignmentType.CENTER })],
    [h('', 0), h(`REEVALUACIÓN\n${cabEval(re)}`, 1), h(`ANTERIOR\n${cabEval(an)}`, 2), h('ANÁLISIS / CONFORMIDAD', 3),
      h('', 4), h(`REEVALUACIÓN\n${cabEval(re)}`, 5), h(`ANTERIOR\n${cabEval(an)}`, 6), h('ANÁLISIS / CONFORMIDAD', 7)],
  ];
  for (let i = 0; i < total; i += 1) {
    const [etB, claveB, negB] = FILAS_BALANCE[i];
    const [etR, claveR, negR] = FILAS_RESULTADOS[i] || ['', null];
    const fila = [
      celda(etB, { w: a[0], bold: Boolean(negB), size: 13 }),
      celda(mostrar(re, 'balance', claveB), { w: a[1], size: 13, bold: Boolean(negB), align: AlignmentType.RIGHT }),
      celda(mostrar(an, 'balance', claveB), { w: a[2], size: 13, bold: Boolean(negB), align: AlignmentType.RIGHT }),
    ];
    if (i === 0) fila.push(celda(conf('balance'), { w: a[3], rowSpan: total, size: 13, valign: VerticalAlign.TOP }));
    fila.push(
      celda(etR, { w: a[4], bold: Boolean(negR), size: 13 }),
      celda(mostrar(re, 'resultados', claveR), { w: a[5], size: 13, bold: Boolean(negR), align: AlignmentType.RIGHT }),
      celda(mostrar(an, 'resultados', claveR), { w: a[6], size: 13, bold: Boolean(negR), align: AlignmentType.RIGHT }),
    );
    if (i === 0) fila.push(celda(conf('resultados'), { w: a[7], rowSpan: total, size: 13, valign: VerticalAlign.TOP }));
    filas.push(fila);
  }
  return [
    parrafo('Análisis vertical del informe de reevaluación de la unidad económica o negocio expuesto por el asesor, respecto a la evaluación anterior.', { size: 14, before: 80, after: 30 }),
    tabla(a, filas),
  ];
}

function seccionEndeudamiento(d) {
  const a = [4800, 1500, 1800, 2106];
  const bloque = (lista) => tabla(a, [
    ['ENTIDAD', 'SALDO S/', 'CALIFICACIÓN', 'TIPO DE CRÉDITO'].map((t, i) => celda(t, { w: a[i], bold: true, fill: GRIS, size: 13, align: AlignmentType.CENTER })),
    ...(lista.length ? lista : [{}]).map((x) => [val(x.entidad), n2(x.saldo), val(x.calificacion), val(x.tipo_credito)].map((t, i) => celda(t, { w: a[i], size: 13, align: i === 1 ? AlignmentType.RIGHT : AlignmentType.LEFT }))),
  ]);
  const salida = [
    titulo('INFORMACIÓN SOBRE ENDEUDAMIENTO DEL CLIENTE Y CÓNYUGE'),
    d?.fecha_corte ? nota(`Situación al ${dmy(d.fecha_corte)}`) : espacio(10),
    bloque(d?.entidades || []),
  ];
  if ((d?.entidades_conyuge || []).length) salida.push(parrafo('CÓNYUGE', { bold: true, size: 14, before: 60, after: 20, keepNext: true }), bloque(d.entidades_conyuge));
  return salida;
}

// ---------- secciones de lo que registra el auditor (compartidas) ----------
function seccionComentarioNegocio(comentario) {
  const a = [2400, 7806];
  return [
    titulo('INFORMACIÓN DEL CLIENTE Y NEGOCIO'),
    tabla(a, [
      [celda('Detalle', { w: a[0], bold: true, fill: GRIS }), celda('Comentario', { w: a[1], bold: true, fill: GRIS })],
      [celda('Comentario general del negocio:', { w: a[0] }), celda(val(comentario, ''), { w: a[1] })],
    ]),
  ];
}

// Las mismas preguntas en las dos fichas del banco (la de Consumo también pregunta si el titular administra el negocio).
function seccionCuestionario(r) {
  const respuestas = r || {};
  const mitad = ANCHO / 2;
  const q = (texto, clave) => `${texto}: ${siNo(respuestas[clave])}`;
  const filas = [
    [`¿Dónde realiza sus pagos?: ${val(respuestas.donde_realiza_pagos, '')}`, q('¿Cónyuge tiene conocimiento del préstamo?', 'conyuge_conoce_prestamo')],
    [q('¿Alguna vez entregó dinero al asesor por alguna razón?', 'entrego_dinero_asesor'), q('¿Tiene Ud. créditos paralelos?', 'creditos_paralelos')],
    [q('¿Ud. ha pagado alguna comisión adicional por el desembolso de su crédito?', 'pago_comision_adicional'), q('¿Ud. ha recibido el total del monto solicitado?', 'recibio_monto_total')],
    [q('¿Comparte el dinero del crédito con otra persona?', 'comparte_dinero_credito'), q('¿Titular administra el negocio?', 'titular_administra_negocio')],
  ];
  return [
    titulo('CUESTIONARIO AL CLIENTE'),
    tabla([mitad, mitad], [
      ...filas.map(([izq, der]) => [celda(izq, { w: mitad }), celda(der, { w: mitad })]),
      [celda('MICROSEGUROS:', { w: ANCHO, span: 2, bold: true, fill: GRIS })],
      [celda(q('¿Ud. tiene microseguro?', 'tiene_microseguro'), { w: mitad }), celda(q('¿Ud. recibió toda la información necesaria antes de comprar el microseguro?', 'recibio_info_microseguro'), { w: mitad })],
      [celda(q('¿Está conforme con el microseguro comprado?', 'conforme_microseguro'), { w: mitad }), celda(`Comentario: ${val(respuestas.comentario_microseguro, '')}`, { w: mitad })],
    ]),
  ];
}

function seccionOtrosClientes(lista) {
  const filas = lista || [];
  const a = [3300, 2000, 2706, 2200];
  return [
    titulo('OTROS CLIENTES QUE DOMICILIAN EN LA VIVIENDA'),
    tabla(a, [
      ['Nombre del cliente', 'Parentesco', 'Actividad', 'Antigüedad del negocio'].map((t, i) => celda(t, { w: a[i], bold: true, fill: GRIS })),
      ...(filas.length ? filas : [{}]).map((f) => [val(f.nombre, ''), val(f.parentesco, ''), val(f.actividad, ''), val(f.antiguedad_negocio, '')].map((t, i) => celda(t, { w: a[i] }))),
    ]),
  ];
}

function seccionOtrosPasivosEIngresos(pasivos, ingresos) {
  const a = [2406, 2600, 2600, 2600];
  const lista = ingresos || [];
  const cab = ['Otros ingresos', 'Ingreso 1', 'Ingreso 2', 'Ingreso 3'];
  return [
    parrafo(`Otros pasivos / pasivos del titular y cónyuge: ${val(pasivos, '______________________________')}`, { size: FS, before: 100, after: 40 }),
    titulo('OTROS INGRESOS (SI LOS TUVIERA)'),
    tabla(a, [
      cab.map((t, i) => celda(t, { w: a[i], bold: true, fill: GRIS })),
      [celda('Origen', { w: a[0], bold: true }), ...[0, 1, 2].map((i) => celda(val(lista[i]?.origen, ''), { w: a[i + 1] }))],
      [celda('Monto mensual', { w: a[0], bold: true }), ...[0, 1, 2].map((i) => celda(vacio(lista[i]?.monto_mensual) ? '' : n2(lista[i].monto_mensual), { w: a[i + 1] }))],
    ]),
  ];
}

function seccionComentariosFinales(comentario) {
  return [titulo('COMENTARIOS FINALES DEL AUDITOR'), tabla([ANCHO], [[celda(val(comentario, ' '), { w: ANCHO, valign: VerticalAlign.TOP })]])];
}

// Firma PNG (data URL) dentro de una celda; sin firma devuelve `vacio`, para firmar a mano al imprimir.
function contenidoFirma(firma, vacio) {
  if (firma && firma.startsWith('data:image/png;base64,')) {
    return [new Paragraph({ keepNext: true, children: [new ImageRun({ data: Buffer.from(firma.split(',')[1], 'base64'), type: 'png', transformation: { width: 170, height: 80 } })] })];
  }
  return vacio;
}

// Firma del cliente y firma del auditor de campo (el verificador), con la que cierra su trabajo. Una visita que viene de una app anterior,
// sin firma del auditor, deja ese recuadro en blanco para firmarlo y sellarlo a mano.
function seccionFirmas(visita, e) {
  const a = [3300, 1800, 5106];
  const auditor = `${visita.auditor?.nombres || ''} ${visita.auditor?.apellidos || ''}`.trim() || visita.auditor?.username || '';
  return [
    titulo('FIRMAS'),
    tabla(a, [
      [celda('FIRMA DEL CLIENTE', { w: a[0], bold: true, fill: GRIS }), celda('', { w: a[1], fill: GRIS }), celda('FIRMA Y SELLO DEL AUDITOR DE CAMPO (VERIFICADOR)', { w: a[2], bold: true, fill: GRIS })],
      [celda(contenidoFirma(visita.firma_evidencia, ' '), { w: a[0] }), celda('', { w: a[1] }), celda(contenidoFirma(visita.firma_auditor, ' \n \n '), { w: a[2] })],
      [celda(`N.º DE DNI: ${val(visita.firmante_documento || e.numero_documento_cliente)}`, { w: a[0] }), celda('', { w: a[1] }), celda(auditor ? `Auditor de campo: ${auditor}` : ' ', { w: a[2] })],
    ]),
  ];
}

// Pie de trazabilidad: de dónde salieron los datos y con qué garantías se tomó la visita.
function seccionTrazabilidad(visita, e, importacion, huellaFicha) {
  const auditor = `${visita.auditor?.nombres || ''} ${visita.auditor?.apellidos || ''}`.trim() || visita.auditor?.username || '-';
  const origenDatos = importacion
    ? `Datos de la base: archivo "${importacion.archivo}" (importado ${fechaHora(importacion.fecha_creacion)}${importacion.archivo_sha256 ? `, huella ${importacion.archivo_sha256.slice(0, 12)}` : ''}), fila ${val(e.fila_origen)}.`
    : 'Datos de la base: carga manual / sin archivo de origen registrado.';
  // En MYPE el auditor puede ir al domicilio de la persona o al negocio: la ficha dice a cuál fue.
  const alNegocio = visita.ubicacion_visitada === 'NEGOCIO';
  const lugar = alNegocio ? 'negocio' : 'domicilio';
  const ubicacion = visita.distancia_domicilio_m != null
    ? `Distancia al ${lugar} de la base: ${Math.round(Number(visita.distancia_domicilio_m))} m (precisión GPS ±${val(visita.precision_metros != null ? Math.round(Number(visita.precision_metros)) : null)} m).`
    : `${alNegocio ? 'Negocio' : 'Domicilio'} sin coordenadas en la base: no se calculó distancia.`;
  const direccionVisitada = visita.ubicacion_visitada
    ? `Dirección visitada: ${alNegocio ? 'Negocio' : 'Domicilio'}${visita.direccion_visitada ? ` — ${visita.direccion_visitada}` : ''}.`
    : null;
  return [
    titulo('TRAZABILIDAD DE LA FICHA'),
    ...[
      `Auditor: ${auditor}${visita.auditor?.username ? ` (@${visita.auditor.username})` : ''} · Plantilla ${val(visita.plantilla)} · Resultado: ${visita.resultado}`,
      `Check-in del dispositivo: ${fechaHora(visita.fecha_hora_checkin)} · Recibida por el servidor: ${fechaHora(visita.server_received_at)}`,
      ...(direccionVisitada ? [direccionVisitada] : []),
      ubicacion,
      `Ubicación simulada: ${visita.mock_location ? 'SÍ' : 'No detectada'} · Integridad del dispositivo: ${visita.device_integrity_ok ? 'OK' : 'con observaciones'}`,
      origenDatos,
      `Huella de la ficha (SHA-256): ${huellaFicha}`,
      'La evidencia fotográfica no se incluye en este documento: está en el panel de Auditoría de Visitas (Visitas → esta visita → Evidencias).',
    ].map((t) => parrafo(t, { size: 13, before: 10 })),
  ];
}

// ---------- CONSUMO ----------
// Formato del banco para consumo: los datos laborales (empleador, su dirección, referencia, distrito y teléfono) vienen en la
// misma lista de hasta dos "negocios" que en MYPE, más el documento con que sustenta sus ingresos.
function seccionClienteConsumo(e, visita) {
  const c = e.datos_cliente || {};
  const n = e.datos_negocio || {};
  const negocios = n.negocios || [];
  return [
    titulo('DATOS DEL CLIENTE / DATOS LABORALES'),
    tablaPares([
      // Como en la ficha impresa del banco: «N.º de expediente: … Fuente: MPAUCC/NUEVO» (el número de expediente solo sale si la base lo trae).
      [`${c.codigo_expediente_core ? `N.º de expediente: ${c.codigo_expediente_core}      ` : ''}Fuente: ${val(c.fuente)}`],
      [`Fecha de Nac.: ${dmy(c.fecha_nacimiento)}      Edad: ${val(c.edad)}`, `Actividad: ${val(n.actividad)}`],
      [`Nombres y apellidos: ${val(e.nombres_cliente)}`, casillasNegocio(visita.estado_negocio)],
      [`Estado civil: ${val(c.estado_civil)}      ${val(e.tipo_documento_cliente, 'DNI')}: ${val(e.numero_documento_cliente)}`, `Antigüedad: ${antiguedadDe(n)}`],
      [`Dirección del domicilio: ${val(e.direccion_domicilio)}`, `Dirección del empleador: ${val(deNegocios(negocios, 'direccion'))}`],
      [`Distrito: ${val(e.distrito)}      Provincia: ${val(e.provincia)}      Dpto.: ${val(e.departamento)}`, `Referencia: ${val(deNegocios(negocios, 'referencia'))}`],
      [`Referencia del domicilio: ${val(c.referencia_domicilio)}`, `Empleador: ${val(deNegocios(negocios, 'contacto'))}`],
      [`Tipo de vivienda: ${val(c.tipo_vivienda)}      N.º de suministro: ${val(c.numero_suministro)}`, `Documento de ingreso: ${val(n.sustento_ingreso)}`],
      [`Teléfono y/o celular: ${telefonosDe(e, c)}`, `Distrito: ${val(deNegocios(negocios, 'distrito'))}      Teléfono y/o celular: ${val(deNegocios(negocios, 'telefono'))}`],
    ]),
  ];
}

function seccionIngresosConsumo(ev) {
  const consumo = ev?.ingresos_consumo || [];
  // Si la base trajo la evaluación tipo MYPE (ventas con días buenos/malos) y no la de consumo, se imprime esa para no perder los datos.
  if (!consumo.length && (ev?.ingresos || []).length) return seccionIngresosMype(ev, null);
  const a = [3200, 1800, 1200, 1800, 2206];
  return [
    titulo('DATOS DE LA EVALUACIÓN FINANCIERA'),
    parrafo('Ingresos registrados en la evaluación.', { size: 14, after: 30, keepNext: true }),
    tabla(a, [
      ['Descripción', 'Relación', 'Moneda', 'Monto', 'Tipo de ingreso'].map((t, i) => celda(t, { w: a[i], bold: true, fill: GRIS })),
      ...(consumo.length ? consumo : [{}]).map((x) => [val(x.descripcion), val(x.relacion), val(x.moneda), n2(x.monto), val(x.tipo_ingreso)].map((t, i) => celda(t, { w: a[i], align: i === 3 ? AlignmentType.RIGHT : undefined }))),
    ]),
  ];
}

// ---------- armado ----------
/**
 * Arma el documento Word de la ficha.
 * @param {{ visita: object, e: object, plantilla: 'MYPE_V1'|'CONSUMO_V1', empresa?: object, importacion?: object|null, huella: string }} datos
 *   visita = la visita cerrada (con auditor); e = el expediente tal como lo vio el auditor (snapshot).
 */
export function renderizarFicha({ visita, e, plantilla, empresa, importacion = null, huella }) {
  const esMype = plantilla === 'MYPE_V1';
  const cuerpo = esMype
    ? [
        ...seccionEncabezado(e, visita, plantilla, empresa),
        ...seccionClienteNegocioMype(e, visita),
        ...seccionHistorialMype(e),
        ...seccionCreditoYParticipantes(e),
        ...seccionIngresosMype(e.evaluacion_financiera, visita.conformidad_financiera),
        ...seccionBalanceResultados(e.evaluacion_financiera, visita.conformidad_financiera),
        ...seccionEndeudamiento(e.endeudamiento),
        ...seccionComentarioNegocio(visita.comentario_negocio),
        ...seccionCuestionario(visita.respuestas_cuestionario),
        ...seccionOtrosClientes(visita.otros_clientes_domicilio),
        ...seccionOtrosPasivosEIngresos(visita.otros_pasivos, visita.otros_ingresos),
        ...seccionComentariosFinales(visita.comentario_auditor),
        ...seccionFirmas(visita, e),
        ...seccionTrazabilidad(visita, e, importacion, huella),
      ]
    : [
        ...seccionEncabezado(e, visita, plantilla, empresa),
        ...seccionClienteConsumo(e, visita),
        ...seccionHistorialMype(e),
        ...seccionCreditoYParticipantes(e),
        ...seccionIngresosConsumo(e.evaluacion_financiera),
        ...seccionEndeudamiento(e.endeudamiento),
        ...seccionComentarioNegocio(visita.comentario_negocio),
        ...seccionCuestionario(visita.respuestas_cuestionario),
        ...seccionOtrosClientes(visita.otros_clientes_domicilio),
        ...seccionOtrosPasivosEIngresos(visita.otros_pasivos, visita.otros_ingresos),
        ...seccionComentariosFinales(visita.comentario_auditor),
        ...seccionFirmas(visita, e),
        ...seccionTrazabilidad(visita, e, importacion, huella),
      ];

  return new Document({
    creator: `Auditoría de Visitas · ${empresa?.nombre || 'Sulotec'}`,
    title: `Ficha de entrevista — visita ${visita.id_visita}`,
    styles: { default: { document: { run: { font: FONT, size: FS } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: 850, right: 850 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Ficha de entrevista · Visita ${visita.id_visita} · ${e.codigo_expediente} · Página `, size: 13, font: FONT }),
              new TextRun({ children: [PageNumber.CURRENT], size: 13, font: FONT }),
              new TextRun({ text: ' de ', size: 13, font: FONT }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 13, font: FONT }),
            ],
          })],
        }),
      },
      children: cuerpo.flatMap((el) => (el instanceof Table ? [el, separador()] : [el])),
    }],
  });
}
