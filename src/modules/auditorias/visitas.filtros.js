// Filtros de la lista de visitas (pantalla Visitas del panel) y su exportación: piezas puras, sin base de datos, para probarlas solas.
import { filaCsv } from '#modules/sistema/seguridad.filtros.js';

export const RESULTADOS = Object.freeze(['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO']);
export const TIPOS_FICHA = Object.freeze(['CONSUMO', 'OTROS']);

const DIA_MS = 24 * 60 * 60 * 1000;

// «CONFORME,OBSERVADO» → ['CONFORME', 'OBSERVADO'] (sin repetidos). Devuelve null si no hay nada o algo no está permitido.
export function listaDe(texto, validos) {
  if (texto === undefined || texto === null) return null;
  const lista = [...new Set(String(texto).split(',').map((x) => x.trim()).filter(Boolean))];
  return lista.length && lista.every((x) => validos.includes(x)) ? lista : null;
}

// Los días «desde» y «hasta» (AAAA-MM-DD) son del usuario, no de UTC: `desfase` son los minutos que su navegador está detrás de UTC (300 en Perú), el
// mismo que usan los gráficos del Resumen. «Hasta» incluye todo ese día. Devuelve la condición para fecha_hora_checkin o null si no hay fechas.
export function rangoDeFechas({ desde, hasta, desfase = 0 } = {}) {
  const dia = (iso) => Date.parse(`${iso}T00:00:00Z`);
  const rango = {};
  if (desde) rango.gte = new Date(dia(desde) + desfase * 60_000);
  if (hasta) rango.lt = new Date(dia(hasta) + DIA_MS + desfase * 60_000);
  return Object.keys(rango).length ? rango : null;
}

// Condición de Prisma para una lista de visitas. Los filtros de la pantalla se SUMAN entre grupos (resultado Y ficha Y fechas Y auditor...) y dentro de
// un grupo se elige uno o varios (conformes O observadas). `sinResultado` deja fuera el filtro de resultado: así se cuenta cuántas habría de cada resultado.
export function construirDonde(f = {}, { sinResultado = false } = {}) {
  const y = [];
  if (f.estado) y.push({ estado: f.estado });
  if (f.id_usuario_auditor) y.push({ id_usuario_auditor: f.id_usuario_auditor });
  if (!sinResultado && f.resultado?.length) y.push({ resultado: f.resultado.length === 1 ? f.resultado[0] : { in: f.resultado } });
  const expediente = [];
  // Con las dos fichas marcadas es como no filtrar: no se agrega la condición.
  if (f.tipo_credito?.length && f.tipo_credito.length < TIPOS_FICHA.length) expediente.push({ tipo_credito: f.tipo_credito[0] });
  if (f.q) expediente.push({ OR: [{ nombres_cliente: { contains: f.q } }, { codigo_expediente: { contains: f.q } }, { numero_documento_cliente: { contains: f.q } }] });
  if (expediente.length) y.push({ expediente: { AND: expediente } });
  if (f.con_alertas === 'true') y.push({ OR: [{ mock_location: true }, { device_integrity_ok: false }, { resultado: { in: ['OBSERVADO', 'RECHAZADO'] } }] });
  const rango = rangoDeFechas(f);
  if (rango) y.push({ fecha_hora_checkin: rango });
  return y.length ? { AND: y } : {};
}

// Cuántas visitas hay de cada resultado (ceros incluidos) a partir del groupBy de la base.
export function conteosPorResultado(filas = []) {
  const conteos = Object.fromEntries(RESULTADOS.map((r) => [r, 0]));
  for (const fila of filas) if (fila.resultado in conteos) conteos[fila.resultado] = Number(fila._count?._all ?? fila.n ?? 0);
  return { ...conteos, total: RESULTADOS.reduce((s, r) => s + conteos[r], 0) };
}

// ---------------------------------------------------------------- exportar a CSV
const ETIQUETA_RESULTADO = { CONFORME: 'Conforme', OBSERVADO: 'Observado', NO_UBICADO: 'No ubicado', RECHAZADO: 'Rechazado' };
export const COLUMNAS_CSV = Object.freeze([
  'Fecha', 'Hora', 'Código del expediente', 'Cliente', 'Documento', 'Tipo de ficha', 'Agencia', 'Asesor responsable', 'Auditor', 'Resultado',
  'Distancia al punto visitado (m)', 'Lugar visitado', 'GPS real', 'Dispositivo íntegro', 'Fotografías', 'Dentro de la geocerca', 'Comentario del auditor',
]);

const dosDigitos = (n) => String(n).padStart(2, '0');
// Fecha y hora del usuario (no de UTC) con el mismo `desfase` de los filtros.
export function fechaYHora(fecha, desfase = 0) {
  const d = new Date(new Date(fecha).getTime() - desfase * 60_000);
  return [`${d.getUTCFullYear()}-${dosDigitos(d.getUTCMonth() + 1)}-${dosDigitos(d.getUTCDate())}`, `${dosDigitos(d.getUTCHours())}:${dosDigitos(d.getUTCMinutes())}`];
}

// Una fila del CSV. `radioM` es la geocerca de la empresa. Los «Sí/No» salen en palabras para que quien abra el archivo no tenga que interpretar nada.
export function filaVisitaCsv(v, { desfase = 0, radioM = 100 } = {}) {
  const [dia, hora] = fechaYHora(v.fecha_hora_checkin, desfase);
  const e = v.expediente || {};
  const a = v.auditor || {};
  const distancia = v.distancia_domicilio_m != null ? Math.round(Number(v.distancia_domicilio_m)) : null;
  const fotos = v.evidencias?.length || 0;
  return filaCsv([
    dia, hora, e.codigo_expediente, e.nombres_cliente, e.numero_documento_cliente, e.tipo_credito === 'OTROS' ? 'MYPE' : 'Consumo', e.oficina, e.asesor_responsable,
    [a.nombres, a.apellidos].filter(Boolean).join(' ') || a.username, ETIQUETA_RESULTADO[v.resultado] || v.resultado,
    distancia, v.ubicacion_visitada === 'NEGOCIO' ? 'Negocio' : 'Domicilio', v.mock_location ? 'No (GPS simulado)' : 'Sí', v.device_integrity_ok ? 'Sí' : 'No', fotos,
    distancia == null ? 'Sin dato' : distancia <= radioM ? 'Sí' : 'No', v.comentario_auditor,
  ]);
}
