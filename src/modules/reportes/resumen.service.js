import prisma from '#core/config/prisma.js';
import { Prisma } from '../../generated/prisma/index.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { reglas as reglasEmpresa } from '#modules/empresas/empresas.service.js';
import { cubetasDe, agruparPorCubeta, aFecha, aIso } from './actividad.js';

// Resumen operativo para la pantalla de inicio del panel: avance de la muestra, resultados de las
// visitas, actividad reciente, carga por auditor y la cola de visitas que conviene revisar primero.

const DIAS_ACTIVIDAD = 14;
const MAX_COLA = 12;

const conteo = (filas, clave) => Object.fromEntries(filas.map((f) => [f[clave], f._count._all]));

// Por qué una visita está en la cola de revisión. El orden de los motivos es el de gravedad.
function motivosDeRevision(v, geocercaM) {
  const motivos = [];
  if (v.mock_location) motivos.push('GPS simulado');
  if (!v.device_integrity_ok) motivos.push('Dispositivo con observaciones');
  if (v.resultado === 'RECHAZADO') motivos.push('Rechazada');
  if (v.resultado === 'NO_UBICADO') motivos.push('Cliente no ubicado');
  if (v.resultado === 'OBSERVADO') motivos.push('Observada por el auditor');
  if (v.distancia_domicilio_m != null && Number(v.distancia_domicilio_m) > geocercaM) {
    motivos.push(`A ${Math.round(Number(v.distancia_domicilio_m))} m del domicilio`);
  }
  if (!v.evidencias.length) motivos.push('Sin fotos');
  return motivos;
}

function empresaDeLaPeticion() {
  const empresaId = empresaActual();
  if (!empresaId) { const error = new Error('Falta la empresa de la sesión'); error.statusCode = 403; throw error; }
  return empresaId;
}

async function obtenerResumen() {
  const empresaId = empresaDeLaPeticion(); // las consultas crudas no pasan por el filtro de empresa de Prisma: se filtra aquí
  const geocercaM = (await reglasEmpresa()).geocerca_radio_m; // regla de la empresa de la petición
  const desde = new Date();
  desde.setDate(desde.getDate() - (DIAS_ACTIVIDAD - 1));
  desde.setHours(0, 0, 0, 0);
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [porEstado, porResultado, tipos, activas, auditores, recientes, cargaActiva, visitas30, ultimas, distritos] = await Promise.all([
    prisma.expediente.groupBy({ by: ['estado'], _count: { _all: true } }),
    prisma.visitaAuditoria.groupBy({ by: ['resultado'], _count: { _all: true } }),
    prisma.expediente.groupBy({ by: ['tipo_credito'], _count: { _all: true } }),
    prisma.asignacionAuditoria.count({ where: { estado: 'ACTIVA' } }),
    prisma.usuario.findMany({ where: { rol: 'AUDITOR', estado: 'ACTIVO' }, select: { id_usuario: true, nombres: true, apellidos: true, username: true, departamento: true } }),
    // Visitas por día contadas en la base (antes se traían todas las filas de 14 días y se contaban en memoria).
    prisma.$queryRaw(Prisma.sql`SELECT DATE_FORMAT(fecha_hora_checkin, '%Y-%m-%d') AS d, COUNT(*) AS n FROM visitas_auditoria WHERE empresa_id = ${empresaId} AND fecha_hora_checkin >= ${desde} GROUP BY d`),
    prisma.asignacionAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { estado: 'ACTIVA' }, _count: { _all: true } }),
    prisma.visitaAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { fecha_hora_checkin: { gte: hace30 } }, _count: { _all: true } }),
    prisma.visitaAuditoria.findMany({
      orderBy: { fecha_creacion: 'desc' }, take: 120,
      select: {
        id_visita: true, resultado: true, plantilla: true, fecha_hora_checkin: true, distancia_domicilio_m: true, mock_location: true, device_integrity_ok: true,
        expediente: { select: { codigo_expediente: true, nombres_cliente: true, tipo_credito: true } },
        auditor: { select: { nombres: true, apellidos: true, username: true } },
        evidencias: { select: { id_evidencia: true } },
      },
    }),
    // Distritos con más visitas en los últimos 30 días.
    prisma.$queryRaw(Prisma.sql`SELECT e.distrito AS distrito, COUNT(*) AS n FROM visitas_auditoria v JOIN expedientes e ON e.id_expediente = v.id_expediente WHERE v.empresa_id = ${empresaId} AND v.fecha_hora_checkin >= ${hace30} AND e.distrito IS NOT NULL AND e.distrito <> '' GROUP BY e.distrito ORDER BY n DESC LIMIT 4`),
  ]);

  // Actividad por día (rellena los días sin visitas con 0 para que el gráfico no tenga huecos)
  const porDia = new Map();
  for (let i = 0; i < DIAS_ACTIVIDAD; i += 1) {
    const d = new Date(desde);
    d.setDate(desde.getDate() + i);
    porDia.set(d.toISOString().slice(0, 10), 0);
  }
  for (const f of recientes) if (porDia.has(f.d)) porDia.set(f.d, Number(f.n));
  const ultimosSiete = [...porDia.values()].slice(-7).reduce((s, n) => s + n, 0);

  const cargaPorAuditor = Object.fromEntries(cargaActiva.map((c) => [c.id_usuario_auditor, c._count._all]));
  const visitasPorAuditor = Object.fromEntries(visitas30.map((c) => [c.id_usuario_auditor, c._count._all]));

  const cola = ultimas
    .map((v) => ({ v, motivos: motivosDeRevision(v, geocercaM) }))
    .filter((x) => x.motivos.length)
    .slice(0, MAX_COLA)
    .map(({ v, motivos }) => ({
      id_visita: v.id_visita, resultado: v.resultado, plantilla: v.plantilla, fecha: v.fecha_hora_checkin,
      cliente: v.expediente?.nombres_cliente, codigo: v.expediente?.codigo_expediente, tipo_credito: v.expediente?.tipo_credito,
      auditor: `${v.auditor?.nombres || ''} ${v.auditor?.apellidos || ''}`.trim() || v.auditor?.username,
      motivos,
    }));

  const estados = conteo(porEstado, 'estado');
  const resultados = conteo(porResultado, 'resultado');
  return {
    expedientes: {
      total: porEstado.reduce((s, f) => s + f._count._all, 0),
      por_estado: { PENDIENTE: estados.PENDIENTE || 0, ASIGNADO: estados.ASIGNADO || 0, VISITADO: estados.VISITADO || 0, CERRADO: estados.CERRADO || 0 },
      por_tipo: { CONSUMO: conteo(tipos, 'tipo_credito').CONSUMO || 0, OTROS: conteo(tipos, 'tipo_credito').OTROS || 0 },
    },
    asignaciones_activas: activas,
    visitas: {
      total: porResultado.reduce((s, f) => s + f._count._all, 0),
      por_resultado: { CONFORME: resultados.CONFORME || 0, OBSERVADO: resultados.OBSERVADO || 0, NO_UBICADO: resultados.NO_UBICADO || 0, RECHAZADO: resultados.RECHAZADO || 0 },
      actividad: [...porDia.entries()].map(([dia, total]) => ({ dia, total })),
      recientes: ultimosSiete, // visitas de los últimos 7 días
    },
    distritos_visitados: distritos.map((f) => ({ distrito: f.distrito, visitas: Number(f.n) })),
    auditores: auditores
      .map((a) => ({
        id: a.id_usuario, nombre: `${a.nombres || ''} ${a.apellidos || ''}`.trim() || a.username, usuario: a.username, zona: a.departamento,
        asignadas_activas: cargaPorAuditor[a.id_usuario] || 0, visitas_30_dias: visitasPorAuditor[a.id_usuario] || 0,
      }))
      .sort((x, y) => y.asignadas_activas - x.asignadas_activas),
    cola_revision: cola,
    geocerca_m: geocercaM,
  };
}

// Series que dibuja el gráfico del Resumen, una por tarjeta: qué se cuenta y por qué fecha. Los nombres de tabla y columna son constantes del
// código (la petición solo elige la clave, que valida el esquema), nunca texto del usuario. Cada una tiene su índice (empresa_id, [resultado,] fecha).
const SERIES = {
  expedientes: { tabla: Prisma.raw('expedientes'), fecha: Prisma.raw('fecha_creacion'), filtro: Prisma.empty },
  asignaciones: { tabla: Prisma.raw('asignaciones_auditoria'), fecha: Prisma.raw('fecha_asignacion'), filtro: Prisma.empty },
  visitas: { tabla: Prisma.raw('visitas_auditoria'), fecha: Prisma.raw('fecha_hora_checkin'), filtro: Prisma.empty },
  observados: { tabla: Prisma.raw('visitas_auditoria'), fecha: Prisma.raw('fecha_hora_checkin'), filtro: Prisma.sql`AND resultado = 'OBSERVADO'` },
};

// Lo que se registró por día, semana o mes en la serie elegida (expedientes cargados, asignaciones hechas, visitas, visitas observadas).
// `hasta` y `desfase` (minutos que el navegador está detrás de UTC, 300 en Perú) hacen que los días sean los del usuario y no los de UTC.
// Un solo GROUP BY por día sobre una ventana acotada (7 días, 8 semanas o 6 meses); las semanas y los meses se arman en memoria.
async function actividad({ metrica = 'asignaciones', periodo = 'diario', hasta, desfase = 0 } = {}) {
  const empresaId = empresaDeLaPeticion();
  const serie = SERIES[metrica];
  if (!serie) { const error = new Error('Serie desconocida'); error.statusCode = 400; throw error; }
  const fin = hasta || aIso(new Date(Date.now() - desfase * 60000));
  const cubetas = cubetasDe(periodo, fin);
  const inicioUtc = new Date(aFecha(cubetas[0].inicio).getTime() + desfase * 60000);
  const finUtc = new Date(aFecha(fin).getTime() + 24 * 60 * 60 * 1000 + desfase * 60000);
  const filas = await prisma.$queryRaw(Prisma.sql`SELECT DATE_FORMAT(DATE_SUB(${serie.fecha}, INTERVAL ${desfase} MINUTE), '%Y-%m-%d') AS d, COUNT(*) AS n FROM ${serie.tabla} WHERE empresa_id = ${empresaId} ${serie.filtro} AND ${serie.fecha} >= ${inicioUtc} AND ${serie.fecha} < ${finUtc} GROUP BY d`);
  const puntos = agruparPorCubeta(cubetas, new Map(filas.map((f) => [f.d, Number(f.n)])));
  return { metrica, periodo, desde: cubetas[0].inicio, hasta: fin, total: puntos.reduce((s, p) => s + p.total, 0), puntos };
}

export default { obtenerResumen, actividad };
