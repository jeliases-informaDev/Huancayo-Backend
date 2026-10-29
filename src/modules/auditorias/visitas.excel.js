// Reporte de visitas en Excel (.xlsx): lo que se descarga desde Visitas > Exportar. Es la versión con formato del CSV: la misma información y más (ubicación de la
// visita y del cliente, cuestionario al cliente, negocio), en columnas agrupadas, con una columna de alertas que dice por qué una visita merece mirarse, colores por
// resultado y una hoja de resumen con los filtros usados. Aquí solo hay piezas puras (columnas, valores, alertas, textos); el archivo se escribe en visitas.service.js.
import { fechaYHora } from './visitas.filtros.js';

export const ETIQUETA_RESULTADO = { CONFORME: 'Conforme', OBSERVADO: 'Observado', NO_UBICADO: 'No ubicado', RECHAZADO: 'Rechazado' };
// Colores (ARGB) de cada resultado: los mismos de las pastillas del panel y de los documentos.
export const COLOR_RESULTADO = {
  CONFORME: { fondo: 'FFE7F4ED', texto: 'FF267254' }, OBSERVADO: { fondo: 'FFFFF1D8', texto: 'FF8A5917' },
  NO_UBICADO: { fondo: 'FFE8ECF9', texto: 'FF3B4A8A' }, RECHAZADO: { fondo: 'FFFCEBED', texto: 'FFA33C43' },
};
const ORIGEN_UBICACION = { REFERENCIA: 'Coordenadas de la base', MANUAL: 'Fijada en el panel', PRIMERA_VISITA: 'Primera visita', GEOCODIFICADA: 'Ubicada por el mapa', MANZANA_VECINA: 'Por manzana vecina (visitas anteriores)' };
const ESTADO_NEGOCIO = { EN_FUNCIONAMIENTO: 'En funcionamiento', INOPERATIVO: 'Inoperativo', DE_TERCEROS: 'De terceros' };
const PROPIEDAD_LOCAL = { PROPIO: 'Propio', ALQUILADO: 'Alquilado', FAMILIAR: 'Familiar', OTRO: 'Otro' };

// Preguntas Sí/No del cuestionario al cliente. `alerta` es la respuesta que merece mirarse (entregar dinero al asesor, pagar una comisión, no recibir el monto completo).
export const PREGUNTAS = Object.freeze([
  { clave: 'conyuge_conoce_prestamo', titulo: '¿El cónyuge conoce el préstamo?' },
  { clave: 'entrego_dinero_asesor', titulo: '¿Entregó dinero al asesor?', alerta: true, aviso: 'Entregó dinero al asesor' },
  { clave: 'creditos_paralelos', titulo: '¿Tiene créditos paralelos?' },
  { clave: 'pago_comision_adicional', titulo: '¿Pagó una comisión adicional?', alerta: true, aviso: 'Pagó una comisión adicional' },
  { clave: 'recibio_monto_total', titulo: '¿Recibió el monto solicitado completo?', alerta: false, aviso: 'No recibió el monto completo' },
  { clave: 'comparte_dinero_credito', titulo: '¿Comparte el dinero con otra persona?' },
  { clave: 'titular_administra_negocio', titulo: '¿El titular administra el negocio?' },
  { clave: 'tiene_microseguro', titulo: '¿Tiene microseguro?' },
  { clave: 'recibio_info_microseguro', titulo: '¿Recibió información del microseguro?' },
  { clave: 'conforme_microseguro', titulo: '¿Está conforme con el microseguro?' },
]);

// Cada columna: grupo (franja de arriba), título, ancho en caracteres, formato de número opcional y alineación.
export const COLUMNAS = Object.freeze([
  { g: 'Visita', t: 'Fecha', w: 11, f: 'dd/mm/yyyy', c: true }, { g: 'Visita', t: 'Hora', w: 7, c: true }, { g: 'Visita', t: 'Código del expediente', w: 21 },
  { g: 'Visita', t: 'Cliente', w: 28 }, { g: 'Visita', t: 'Resultado', w: 13, c: true }, { g: 'Visita', t: 'Alertas', w: 36 }, { g: 'Visita', t: 'Auditor', w: 22 },
  { g: 'Cliente', t: 'Documento', w: 12, c: true }, { g: 'Cliente', t: 'Tipo de ficha', w: 11, c: true }, { g: 'Cliente', t: 'Agencia', w: 20 }, { g: 'Cliente', t: 'Asesor responsable', w: 26 },
  { g: 'Cliente', t: 'Distrito', w: 15 }, { g: 'Cliente', t: 'Dirección registrada', w: 34 },
  { g: 'Dónde se hizo la visita', t: 'Lugar visitado', w: 12, c: true }, { g: 'Dónde se hizo la visita', t: 'Dirección visitada', w: 34 },
  { g: 'Dónde se hizo la visita', t: 'Latitud de la visita', w: 12, f: '0.000000', c: true }, { g: 'Dónde se hizo la visita', t: 'Longitud de la visita', w: 12, f: '0.000000', c: true },
  { g: 'Dónde se hizo la visita', t: 'Precisión del GPS (m)', w: 11, f: '#,##0', c: true }, { g: 'Dónde se hizo la visita', t: 'Distancia al punto (m)', w: 11, f: '#,##0', c: true },
  { g: 'Dónde se hizo la visita', t: 'Dentro de la geocerca', w: 11, c: true },
  { g: 'Dónde se hizo la visita', t: 'Latitud del cliente', w: 12, f: '0.000000', c: true }, { g: 'Dónde se hizo la visita', t: 'Longitud del cliente', w: 12, f: '0.000000', c: true },
  { g: 'Dónde se hizo la visita', t: 'De dónde salió el punto', w: 20 },
  { g: 'Controles', t: 'GPS real', w: 13, c: true }, { g: 'Controles', t: 'Dispositivo íntegro', w: 11, c: true }, { g: 'Controles', t: 'Fotografías', w: 10, f: '0', c: true },
  { g: 'Cuestionario al cliente', t: '¿Dónde realiza sus pagos?', w: 24 },
  ...PREGUNTAS.map((p) => ({ g: 'Cuestionario al cliente', t: p.titulo, w: 15, c: true })),
  { g: 'Negocio (MYPE)', t: 'Estado del negocio', w: 17 }, { g: 'Negocio (MYPE)', t: 'Propiedad del local', w: 14 },
  { g: 'Comentarios', t: 'Comentario del auditor', w: 52, ajustar: true }, { g: 'Comentarios', t: 'Comentario sobre el negocio', w: 52, ajustar: true },
]);

export const COLOR_GRUPO = Object.freeze({
  Visita: 'FF2F3E9E', Cliente: 'FF4A5BC4', 'Dónde se hizo la visita': 'FF2F3E9E', Controles: 'FF4A5BC4', 'Cuestionario al cliente': 'FF2F3E9E', 'Negocio (MYPE)': 'FF4A5BC4', Comentarios: 'FF2F3E9E',
});

const IDX = Object.fromEntries(COLUMNAS.map((c, i) => [c.t, i]));
export const idx = (titulo) => IDX[titulo];
const num = (v) => (v == null ? null : Number(v));
const sn = (v) => (v === true ? 'Sí' : v === false ? 'No' : '');

// Qué le llama la atención al revisor de esta visita, en palabras. Vacío = nada que mirar. Mismo criterio de «con alertas» del panel (GPS simulado, dispositivo no
// íntegro, observada o rechazada) más lo que dijo el cliente y estar fuera de la geocerca.
export function alertasDeVisita(v, { radioM = 100 } = {}) {
  const lista = [];
  if (v.mock_location) lista.push('GPS simulado');
  if (v.device_integrity_ok === false) lista.push('Dispositivo no íntegro');
  const distancia = num(v.distancia_domicilio_m);
  if (distancia != null && distancia > radioM) lista.push(`Fuera de la geocerca (${Math.round(distancia)} m)`);
  const r = v.respuestas_cuestionario || {};
  for (const p of PREGUNTAS) if (p.aviso && r[p.clave] === p.alerta) lista.push(p.aviso);
  if (!(v.evidencias?.length)) lista.push('Sin fotografías');
  return lista;
}

// Los valores de una visita, en el orden de COLUMNAS, más las posiciones de las celdas que van en rojo y en verde.
export function filaVisitaXlsx(v, { desfase = 0, radioM = 100 } = {}) {
  const [dia, hora] = fechaYHora(v.fecha_hora_checkin, desfase);
  const [a, m, d] = dia.split('-').map(Number);
  const e = v.expediente || {}; const au = v.auditor || {}; const r = v.respuestas_cuestionario || {};
  const distancia = num(v.distancia_domicilio_m);
  const dentro = distancia == null ? 'Sin dato' : distancia <= radioM ? 'Sí' : 'No';
  const alertas = alertasDeVisita(v, { radioM });
  const valores = [
    new Date(Date.UTC(a, m - 1, d)), hora, e.codigo_expediente ?? '', e.nombres_cliente ?? '', ETIQUETA_RESULTADO[v.resultado] || v.resultado, alertas.join(' · '),
    [au.nombres, au.apellidos].filter(Boolean).join(' ') || au.username || '',
    e.numero_documento_cliente ?? '', e.tipo_credito === 'OTROS' ? 'MYPE' : 'Consumo', e.oficina ?? '', e.asesor_responsable ?? '', e.distrito ?? '', e.direccion_domicilio ?? '',
    v.ubicacion_visitada === 'NEGOCIO' ? 'Negocio' : 'Domicilio', v.direccion_visitada ?? '', num(v.latitud), num(v.longitud), num(v.precision_metros) == null ? null : Math.round(num(v.precision_metros)),
    distancia == null ? null : Math.round(distancia), dentro, num(e.latitud), num(e.longitud), ORIGEN_UBICACION[e.ubicacion_origen] || '',
    v.mock_location ? 'No (simulado)' : 'Sí', v.device_integrity_ok === false ? 'No' : 'Sí', v.evidencias?.length || 0,
    r.donde_realiza_pagos ?? '', ...PREGUNTAS.map((p) => sn(r[p.clave])),
    ESTADO_NEGOCIO[v.estado_negocio] || '', PROPIEDAD_LOCAL[v.propiedad_local] || '',
    v.comentario_auditor ?? '', v.comentario_negocio ?? '',
  ];
  // Celdas a resaltar: en rojo lo que salió mal y en verde lo que salió bien en los controles.
  const malas = new Set(); const buenas = new Set();
  const marca = (titulo, mala, buena) => { if (mala) malas.add(idx(titulo)); else if (buena) buenas.add(idx(titulo)); };
  marca('Dentro de la geocerca', dentro === 'No', dentro === 'Sí');
  marca('GPS real', v.mock_location === true, !v.mock_location);
  marca('Dispositivo íntegro', v.device_integrity_ok === false, v.device_integrity_ok !== false);
  marca('Fotografías', !(v.evidencias?.length), false);
  PREGUNTAS.forEach((p, i) => { if (p.aviso && r[p.clave] === p.alerta) malas.add(idx(PREGUNTAS[0].titulo) + i); });
  if (alertas.length) malas.add(idx('Alertas'));
  return { valores, malas, buenas };
}

// Lo que se aplicó al reporte, en palabras, para la hoja de resumen. `nombreAuditor` ya viene resuelto (el filtro solo trae su id).
export function descripcionDeFiltros(f = {}, { nombreAuditor = null } = {}) {
  const lineas = [];
  const rango = f.desde || f.hasta;
  if (rango) lineas.push(['Periodo', f.desde && f.hasta ? `Del ${f.desde} al ${f.hasta}` : f.desde ? `Desde el ${f.desde}` : `Hasta el ${f.hasta}`]);
  if (f.resultado?.length) lineas.push(['Resultado', f.resultado.map((x) => ETIQUETA_RESULTADO[x] || x).join(', ')]);
  if (f.tipo_credito?.length) lineas.push(['Tipo de ficha', f.tipo_credito.map((x) => (x === 'OTROS' ? 'MYPE' : 'Consumo')).join(', ')]);
  if (f.id_usuario_auditor) lineas.push(['Auditor', nombreAuditor || f.id_usuario_auditor]);
  if (f.con_alertas === 'true') lineas.push(['Solo visitas', 'con alertas']);
  if (f.q) lineas.push(['Búsqueda', f.q]);
  if (f.estado) lineas.push(['Estado de la visita', f.estado]);
  return lineas.length ? lineas : [['Sin filtros', 'Ninguno: se incluyen todas las visitas']];
}
