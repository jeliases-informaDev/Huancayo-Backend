// Reporte de efectividad de los auditores de campo por periodo: la consulta a la base y el Excel. El armado del reporte es puro (efectividad.js).
// Por auditor y por día junta lo hecho (casos cerrados, visitas y resultados) con cómo se movió según el seguimiento en tiempo real (días en campo,
// horas de jornada, kilómetros, primera y última posición, llegadas) y las señales de alerta (fuera de la geocerca, GPS simulado).
import ExcelJS from 'exceljs';
import prisma from '#core/config/prisma.js';
import { Prisma } from '../../generated/prisma/index.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { reglas as reglasEmpresa, publica as empresaPublica } from '#modules/empresas/empresas.service.js';
import { textoZona } from '#modules/auditorias/jornada.core.js';
import { fechaYHora } from '#modules/auditorias/visitas.filtros.js';
import { ETIQUETA_RESULTADO, COLOR_RESULTADO } from '#modules/auditorias/visitas.excel.js';
import { aFecha } from './actividad.js';
import { armarEfectividad } from './efectividad.js';

const DIA_MS = 24 * 60 * 60 * 1000;
const MARGEN_MS = 2 * 60 * 60 * 1000; // puntos del seguimiento que llegaron tarde (sin señal) pero se tomaron dentro del periodo
const SELECCION_AUDITOR = { id_usuario: true, nombres: true, apellidos: true, username: true, estado: true, departamento: true, zona_distrito: true, zona_provincia: true, zona_departamento: true, zona_en: true };
const nombreDe = (a) => `${a.nombres || ''} ${a.apellidos || ''}`.trim() || a.username;
const zonaDe = (a) => (a.zona_en && textoZona({ distrito: a.zona_distrito, provincia: a.zona_provincia, departamento: a.zona_departamento })) || a.departamento || null;
const TIPO_DE_FICHA = { CONSUMO: 'Consumo', OTROS: 'MYPE' };
const LUGAR = { DOMICILIO: 'Domicilio', NEGOCIO: 'Negocio' };

function empresaDeLaPeticion() {
  const empresaId = empresaActual();
  if (!empresaId) { const error = new Error('Falta la empresa de la sesión'); error.statusCode = 403; throw error; }
  return empresaId;
}

// Kilómetros recorridos por auditor y día del usuario, calculados en la base con los puntos buenos del seguimiento (sin simulados ni imprecisos),
// descartando los saltos (más de 180 km/h) y las pausas (más de 5 min entre puntos), igual que el recorrido del panel. Una sola pasada con una función
// de ventana: no se traen los puntos (un mes de 10 auditores son cientos de miles de filas). Consulta cruda: la empresa se filtra a mano.
async function recorridosPorDia(empresaId, inicio, fin, desfase, precisionMax) {
  const filas = await prisma.$queryRaw(Prisma.sql`
    SELECT s.id_usuario AS id_usuario, s.dia AS dia, CAST(SUM(s.d) AS DOUBLE) AS metros, COUNT(*) AS tramos, MIN(s.t0) AS primero, MAX(s.fecha) AS ultimo
    FROM (
      SELECT p.id_usuario, DATE_FORMAT(DATE_SUB(p.fecha, INTERVAL ${desfase} MINUTE), '%Y-%m-%d') AS dia, p.fecha, p.t0,
        2 * 6371000 * ASIN(SQRT(LEAST(1, POWER(SIN(RADIANS(p.latitud - p.lat0) / 2), 2) + COS(RADIANS(p.lat0)) * COS(RADIANS(p.latitud)) * POWER(SIN(RADIANS(p.longitud - p.lon0) / 2), 2)))) AS d,
        TIMESTAMPDIFF(SECOND, p.t0, p.fecha) AS dt
      FROM (
        SELECT id_usuario, COALESCE(capturado_en, registrado_en) AS fecha, latitud, longitud,
          LAG(latitud) OVER w AS lat0, LAG(longitud) OVER w AS lon0, LAG(COALESCE(capturado_en, registrado_en)) OVER w AS t0
        FROM tracking_ubicacion
        WHERE empresa_id = ${empresaId} AND registrado_en >= ${new Date(inicio.getTime() - MARGEN_MS)} AND registrado_en < ${new Date(fin.getTime() + MARGEN_MS)}
          AND simulada = 0 AND (precision_metros IS NULL OR precision_metros <= ${precisionMax})
        WINDOW w AS (PARTITION BY id_usuario ORDER BY COALESCE(capturado_en, registrado_en))
      ) p
      WHERE p.lat0 IS NOT NULL
    ) s
    WHERE s.dt BETWEEN 1 AND 300 AND s.d <= s.dt * 50 AND s.fecha >= ${inicio} AND s.fecha < ${fin}
    GROUP BY s.id_usuario, s.dia`);
  return filas.map((f) => ({ id_usuario: f.id_usuario, dia: f.dia, metros: Number(f.metros || 0), puntos: Number(f.tramos || 0) + 1, primero: f.primero, ultimo: f.ultimo }));
}

// Todo lo del periodo: el reporte armado más las visitas (para la hoja de visitas del Excel). `desde`/`hasta` son días del usuario y `desfase` los
// minutos que su navegador está detrás de UTC (300 en Perú): así el periodo son sus días y no los de UTC.
async function efectividadCompleta({ desde, hasta, desfase = 0 }) {
  const empresaId = empresaDeLaPeticion();
  const aUtc = (iso) => new Date(aFecha(iso).getTime() + desfase * 60000);
  const inicio = aUtc(desde);
  const fin = new Date(aUtc(hasta).getTime() + DIA_MS);
  const reglas = await reglasEmpresa();
  const [usuarios, visitas, asignadasBd, finalizadas, pendientesBd, jornadas, llegadas, recorridos, empresa] = await Promise.all([
    prisma.usuario.findMany({ where: { rol: 'AUDITOR' }, select: SELECCION_AUDITOR }),
    prisma.visitaAuditoria.findMany({
      where: { fecha_hora_checkin: { gte: inicio, lt: fin } }, orderBy: { fecha_hora_checkin: 'asc' },
      select: {
        id_visita: true, id_usuario_auditor: true, id_expediente: true, fecha_hora_checkin: true, fecha_hora_checkout: true, resultado: true, distancia_domicilio_m: true,
        precision_metros: true, mock_location: true, ubicacion_visitada: true, expediente: { select: { codigo_expediente: true, nombres_cliente: true, distrito: true, tipo_credito: true } },
      },
    }),
    prisma.asignacionAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { fecha_asignacion: { gte: inicio, lt: fin }, estado: { not: 'CANCELADA' } }, _count: { _all: true } }),
    prisma.asignacionAuditoria.findMany({ where: { estado: 'FINALIZADA', fecha_fin: { gte: inicio, lt: fin } }, select: { id_usuario_auditor: true, fecha_fin: true } }),
    // Pendientes al inicio: asignados antes del periodo y que al empezar seguían abiertos (sin fecha de fin o cerrados después).
    prisma.asignacionAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { fecha_asignacion: { lt: inicio }, estado: { not: 'CANCELADA' }, OR: [{ fecha_fin: null }, { fecha_fin: { gte: inicio } }] }, _count: { _all: true } }),
    prisma.jornadaCampo.findMany({ where: { inicio: { gte: inicio, lt: fin } }, select: { id_usuario: true, inicio: true, fin: true, cierre: true } }),
    prisma.eventoCampo.findMany({ where: { tipo: 'LLEGADA', registrado_en: { gte: inicio, lt: fin } }, select: { id_usuario: true, id_expediente: true, registrado_en: true } }),
    recorridosPorDia(empresaId, inicio, fin, desfase, reglas.precision_maxima_m),
    Promise.resolve(empresaPublica(empresaId)).catch(() => null),
  ]);
  const casos = new Map();
  const sumar = (id, clave, n) => { if (!casos.has(id)) casos.set(id, { pendientes_inicio: 0, asignados: 0, finalizados: 0 }); casos.get(id)[clave] += n; };
  for (const a of asignadasBd) sumar(a.id_usuario_auditor, 'asignados', a._count._all);
  for (const p of pendientesBd) sumar(p.id_usuario_auditor, 'pendientes_inicio', p._count._all);
  for (const f of finalizadas) sumar(f.id_usuario_auditor, 'finalizados', 1);
  const auditores = usuarios.map((u) => ({ id: u.id_usuario, nombre: nombreDe(u), usuario: u.username, zona: zonaDe(u), activo: u.estado === 'ACTIVO' }));
  const reporte = armarEfectividad({
    desde, hasta, desfase, geocercaM: reglas.geocerca_radio_m, auditores,
    visitas: visitas.map((v) => ({
      id_usuario: v.id_usuario_auditor, fecha: v.fecha_hora_checkin, checkout: v.fecha_hora_checkout, resultado: v.resultado,
      distancia_m: v.distancia_domicilio_m == null ? null : Number(v.distancia_domicilio_m), precision: v.precision_metros == null ? null : Number(v.precision_metros), simulada: v.mock_location,
    })),
    casos, cierres: finalizadas.map((f) => ({ id_usuario: f.id_usuario_auditor, fecha: f.fecha_fin })),
    jornadas, llegadas: llegadas.map((l) => ({ id_usuario: l.id_usuario, id_expediente: l.id_expediente, fecha: l.registrado_en })),
    recorridos,
  });
  return { reporte: { ...reporte, generado_en: new Date().toISOString() }, visitas, auditores, empresa, desfase };
}

async function efectividad(consulta) {
  return (await efectividadCompleta(consulta)).reporte;
}

// ---------------------------------------------------------------- Excel
const AZUL = 'FF2F3E9E';
const relleno = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const porcentaje = (p) => (p == null ? null : p);
const fechaDia = (iso) => new Date(`${iso}T00:00:00Z`);

// Columnas: título, ancho, formato de número y si va centrada.
const COL_AUDITORES = [
  { t: 'Auditor', w: 26 }, { t: 'Usuario', w: 14 }, { t: 'Zona de trabajo', w: 22 }, { t: 'Estado', w: 9, c: true },
  { t: 'Días en campo', w: 9, c: true, f: '0' }, { t: 'Horas en jornada', w: 10, c: true, f: '0.0' }, { t: 'Km recorridos', w: 10, c: true, f: '0.0' },
  { t: 'Inicio promedio', w: 9, c: true }, { t: 'Fin promedio', w: 9, c: true },
  { t: 'Casos al inicio', w: 9, c: true, f: '0' }, { t: 'Casos asignados', w: 9, c: true, f: '0' }, { t: 'Casos cerrados', w: 9, c: true, f: '0' }, { t: 'Casos pendientes al cierre', w: 11, c: true, f: '0' }, { t: 'Cumplimiento', w: 11, c: true, f: '0%' },
  { t: 'Visitas', w: 8, c: true, f: '0' }, { t: 'Conformes', w: 9, c: true, f: '0' }, { t: 'Observadas', w: 9, c: true, f: '0' }, { t: 'No ubicados', w: 9, c: true, f: '0' }, { t: 'Rechazadas', w: 9, c: true, f: '0' }, { t: 'Conformidad', w: 11, c: true, f: '0%' },
  { t: 'Visitas por día en campo', w: 10, c: true, f: '0.0' }, { t: 'Duración promedio (min)', w: 10, c: true, f: '0' }, { t: 'Llegadas detectadas', w: 10, c: true, f: '0' },
  { t: 'Fuera de la geocerca', w: 10, c: true, f: '0' }, { t: 'GPS simulado', w: 9, c: true, f: '0' }, { t: 'Precisión promedio (m)', w: 10, c: true, f: '0' },
];
const COL_DIAS = [
  { t: 'Auditor', w: 26 }, { t: 'Día', w: 11, c: true, f: 'dd/mm/yyyy' }, { t: 'Jornada: inicio', w: 9, c: true }, { t: 'Jornada: fin', w: 9, c: true }, { t: 'Horas en jornada', w: 10, c: true, f: '0.0' },
  { t: 'Primera posición', w: 9, c: true }, { t: 'Última posición', w: 9, c: true }, { t: 'Km recorridos', w: 10, c: true, f: '0.0' }, { t: 'Puntos GPS', w: 9, c: true, f: '#,##0' },
  { t: 'Casos cerrados', w: 9, c: true, f: '0' }, { t: 'Visitas', w: 8, c: true, f: '0' }, { t: 'Conformes', w: 9, c: true, f: '0' }, { t: 'Observadas', w: 9, c: true, f: '0' }, { t: 'No ubicados', w: 9, c: true, f: '0' }, { t: 'Rechazadas', w: 9, c: true, f: '0' },
  { t: 'Llegadas detectadas', w: 10, c: true, f: '0' }, { t: 'Fuera de la geocerca', w: 10, c: true, f: '0' }, { t: 'GPS simulado', w: 9, c: true, f: '0' },
];
const COL_VISITAS = [
  { t: 'Fecha', w: 11, c: true }, { t: 'Hora', w: 7, c: true }, { t: 'Auditor', w: 26 }, { t: 'Código del expediente', w: 21 }, { t: 'Cliente', w: 28 }, { t: 'Tipo de ficha', w: 10, c: true }, { t: 'Distrito', w: 15 },
  { t: 'Lugar visitado', w: 11, c: true }, { t: 'Resultado', w: 13, c: true }, { t: 'Distancia al punto (m)', w: 11, c: true, f: '#,##0' }, { t: 'Dentro de la geocerca', w: 11, c: true },
  { t: 'Precisión del GPS (m)', w: 11, c: true, f: '#,##0' }, { t: 'GPS simulado', w: 9, c: true }, { t: 'Duración (min)', w: 9, c: true, f: '0' },
];

function hoja(wb, nombre, columnas, { congelar = 1 } = {}) {
  const ws = wb.addWorksheet(nombre, { views: [{ state: 'frozen', xSplit: 1, ySplit: congelar, showGridLines: false }], pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
  columnas.forEach((c, i) => { ws.getColumn(i + 1).width = c.w; });
  return ws;
}
function cabecera(ws, columnas) {
  const fila = ws.addRow(columnas.map((c) => c.t));
  fila.height = 44;
  columnas.forEach((c, i) => {
    const celda = fila.getCell(i + 1);
    celda.fill = relleno('FFE8ECF9'); celda.font = { name: 'Calibri', bold: true, size: 10, color: { argb: AZUL } };
    celda.alignment = { vertical: 'middle', horizontal: c.c ? 'center' : 'left', wrapText: true };
    celda.border = { bottom: { style: 'medium', color: { argb: AZUL } } };
  });
}
function filaDatos(ws, columnas, valores, { negrita = false, fondo = null } = {}) {
  const fila = ws.addRow(valores);
  fila.font = { name: 'Calibri', size: 11, bold: negrita };
  columnas.forEach((c, i) => {
    const celda = fila.getCell(i + 1);
    if (c.f) celda.numFmt = c.f;
    celda.alignment = { vertical: 'middle', horizontal: c.c ? 'center' : 'left' };
    celda.border = { bottom: { style: 'thin', color: { argb: 'FFE5E8F2' } } };
    if (fondo) celda.fill = relleno(fondo);
  });
  return fila;
}
const diaLargo = (iso) => new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(fechaDia(iso));

// Escribe el Excel del reporte en `stream` (la respuesta HTTP): Resumen, Auditores, Por día y Visitas.
async function efectividadXlsx(consulta, { stream }) {
  const { reporte, visitas, auditores, empresa, desfase } = await efectividadCompleta(consulta);
  const nombrePorId = new Map(auditores.map((a) => [a.id, a.nombre]));
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GeoMatrix'; wb.created = new Date();
  const [hoyDia, hoyHora] = fechaYHora(new Date(), desfase);

  // ---- Resumen
  const rs = wb.addWorksheet('Resumen', { views: [{ showGridLines: false }] });
  rs.getColumn(1).width = 34; rs.getColumn(2).width = 18; rs.getColumn(3).width = 14; rs.getColumn(4).width = 60;
  const escribir = (valores, { font = {}, alto, unir } = {}) => {
    const fila = rs.addRow(valores);
    fila.font = { name: 'Calibri', size: 11, ...font };
    if (unir) { rs.mergeCells(fila.number, unir[0], fila.number, unir[1]); fila.getCell(unir[0]).alignment = { vertical: 'top', wrapText: true }; }
    if (alto) fila.height = alto;
    return fila;
  };
  escribir(['Efectividad de los auditores de campo'], { font: { size: 20, bold: true, color: { argb: AZUL } }, alto: 32 });
  escribir([`${empresa?.nombre || 'GeoMatrix'} · del ${diaLargo(reporte.desde)} al ${diaLargo(reporte.hasta)} (${reporte.dias_del_periodo} días) · generado el ${hoyDia} a las ${hoyHora}`], { font: { color: { argb: 'FF6B7194' } }, unir: [1, 4] });
  escribir([]);
  escribir(['Totales del periodo'], { font: { bold: true, size: 13, color: { argb: AZUL } } });
  const t = reporte.totales;
  const totales = [
    ['Auditores en el reporte', t.auditores], ['Auditores con visitas', t.auditores_con_visitas],
    ['Casos pendientes al inicio', t.pendientes_inicio], ['Casos asignados en el periodo', t.asignados], ['Casos cerrados en el periodo', t.finalizados], ['Casos pendientes al cierre', t.pendientes_cierre],
    ['Cumplimiento (cerrados / carga)', t.cumplimiento, '0%'],
    ['Visitas', t.visitas], ['Conformes', t.conforme], ['Observadas', t.observado], ['No ubicados', t.no_ubicado], ['Rechazadas', t.rechazado], ['Conformidad (conformes / visitas)', t.conformidad, '0%'],
    ['Días en campo (suma de todos)', t.dias_en_campo], ['Horas en jornada (suma)', t.horas_jornada, '0.0'], ['Km recorridos (suma)', t.km, '0.0'],
    ['Llegadas detectadas por el seguimiento', t.llegadas], ['Visitas fuera de la geocerca', t.fuera_geocerca], ['Visitas con GPS simulado', t.gps_simulado],
  ];
  for (const [etiqueta, valor, formato] of totales) {
    const fila = rs.addRow([etiqueta, valor == null ? 'sin datos' : valor]);
    fila.font = { name: 'Calibri', size: 11 };
    if (formato && valor != null) fila.getCell(2).numFmt = formato;
    fila.getCell(2).alignment = { horizontal: 'left' };
  }
  escribir([]);
  escribir(['Cómo leer este reporte'], { font: { bold: true, size: 13, color: { argb: AZUL } } });
  for (const texto of [
    'Todo cuenta con los días del usuario que descargó el reporte (en Perú, hora de Lima).',
    'Carga de un auditor = casos que tenía pendientes al empezar el periodo + casos que se le asignaron en el periodo. Cumplimiento = casos cerrados en el periodo / carga. Los casos cancelados (quitados) no cuentan.',
    'Conformidad = visitas con resultado «Conforme» / visitas del periodo.',
    'Días en campo: días con al menos una visita, una jornada iniciada o puntos de seguimiento. Horas en jornada: suma de las jornadas que el auditor inició y terminó en la app (una jornada sin terminar no suma horas y se cuenta aparte).',
    'Km recorridos: suma de los tramos entre las posiciones del seguimiento en tiempo real, sin las posiciones imprecisas, simuladas ni los saltos imposibles (como se dibuja el recorrido en el panel). «Sin datos» = ese auditor no transmitió posición (app sin jornada iniciada, o el periodo es anterior a lo que se conserva del seguimiento).',
    'Inicio y fin promedio: hora promedio de la primera y la última posición de cada día en campo (si no hay posiciones, la hora de inicio y fin de la jornada).',
    'Llegadas detectadas: veces que el seguimiento vio al auditor entrar al radio de un cliente asignado (no requieren registrar una visita).',
    `Fuera de la geocerca: visitas registradas a más de ${reporte.geocerca_m} m del punto del cliente. GPS simulado: visitas en las que el celular avisó que la posición no era real.`,
  ]) escribir([texto], { font: { color: { argb: 'FF4B5170' } }, unir: [1, 4], alto: 34 });

  // ---- Auditores
  const wa = hoja(wb, 'Auditores', COL_AUDITORES);
  cabecera(wa, COL_AUDITORES);
  for (const a of reporte.auditores) {
    filaDatos(wa, COL_AUDITORES, [
      a.nombre, a.usuario, a.zona || '', a.activo ? 'Activo' : 'Inactivo',
      a.campo.dias_en_campo, a.campo.horas_jornada, a.campo.km == null ? 'sin datos' : a.campo.km, a.campo.inicio_promedio || '', a.campo.fin_promedio || '',
      a.casos.pendientes_inicio, a.casos.asignados, a.casos.finalizados, a.casos.pendientes_cierre, porcentaje(a.casos.cumplimiento),
      a.visitas.total, a.visitas.conforme, a.visitas.observado, a.visitas.no_ubicado, a.visitas.rechazado, porcentaje(a.visitas.conformidad),
      a.visitas.por_dia_en_campo, a.visitas.duracion_promedio_min, a.visitas.llegadas, a.visitas.fuera_geocerca, a.visitas.gps_simulado, a.visitas.precision_promedio_m,
    ]);
  }
  filaDatos(wa, COL_AUDITORES, [
    'Total', '', '', '', t.dias_en_campo, t.horas_jornada, t.km == null ? 'sin datos' : t.km, '', '',
    t.pendientes_inicio, t.asignados, t.finalizados, t.pendientes_cierre, porcentaje(t.cumplimiento),
    t.visitas, t.conforme, t.observado, t.no_ubicado, t.rechazado, porcentaje(t.conformidad), null, null, t.llegadas, t.fuera_geocerca, t.gps_simulado, null,
  ], { negrita: true, fondo: 'FFF3F4FA' });

  // ---- Por día
  const wd = hoja(wb, 'Por día', COL_DIAS);
  cabecera(wd, COL_DIAS);
  for (const d of reporte.dias) {
    filaDatos(wd, COL_DIAS, [
      nombrePorId.get(d.id_usuario) || d.id_usuario, fechaDia(d.dia), d.jornada_inicio || '', d.jornada_fin || (d.jornadas_sin_cierre ? 'sin terminar' : ''), d.horas_jornada,
      d.primera_posicion || '', d.ultima_posicion || '', d.km == null ? '' : d.km, d.puntos_gps,
      d.casos_cerrados, d.visitas, d.conforme, d.observado, d.no_ubicado, d.rechazado, d.llegadas, d.fuera_geocerca, d.gps_simulado,
    ]);
  }

  // ---- Visitas
  const wv = hoja(wb, 'Visitas', COL_VISITAS);
  cabecera(wv, COL_VISITAS);
  for (const v of visitas) {
    const [dia, hora] = fechaYHora(v.fecha_hora_checkin, desfase);
    const distancia = v.distancia_domicilio_m == null ? null : Math.round(Number(v.distancia_domicilio_m));
    const duracion = v.fecha_hora_checkout && v.fecha_hora_checkout > v.fecha_hora_checkin ? Math.round((v.fecha_hora_checkout - v.fecha_hora_checkin) / 60000) : null;
    const fila = filaDatos(wv, COL_VISITAS, [
      dia, hora, nombrePorId.get(v.id_usuario_auditor) || '', v.expediente?.codigo_expediente || '', v.expediente?.nombres_cliente || '', TIPO_DE_FICHA[v.expediente?.tipo_credito] || '', v.expediente?.distrito || '',
      LUGAR[v.ubicacion_visitada] || 'Domicilio', ETIQUETA_RESULTADO[v.resultado] || v.resultado, distancia, distancia == null ? '' : distancia <= reporte.geocerca_m ? 'Sí' : 'No',
      v.precision_metros == null ? null : Math.round(Number(v.precision_metros)), v.mock_location ? 'Sí' : 'No', duracion,
    ]);
    const color = COLOR_RESULTADO[v.resultado];
    if (color) { const celda = fila.getCell(9); celda.fill = relleno(color.fondo); celda.font = { name: 'Calibri', size: 11, bold: true, color: { argb: color.texto } }; }
    if (distancia != null && distancia > reporte.geocerca_m) fila.getCell(11).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFA33C43' } };
    if (v.mock_location) fila.getCell(13).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFA33C43' } };
  }

  await wb.xlsx.write(stream);
  return { auditores: reporte.auditores.length, visitas: visitas.length };
}

export default { efectividad, efectividadXlsx };
