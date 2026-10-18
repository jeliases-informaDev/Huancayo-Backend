import prisma from '#core/config/prisma.js';
import { reglas as reglasEmpresa } from '#modules/empresas/empresas.service.js';

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

async function obtenerResumen() {
  const geocercaM = (await reglasEmpresa()).geocerca_radio_m; // regla de la empresa de la petición
  const desde = new Date();
  desde.setDate(desde.getDate() - (DIAS_ACTIVIDAD - 1));
  desde.setHours(0, 0, 0, 0);
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [porEstado, porResultado, tipos, activas, auditores, recientes, cargaActiva, visitas30, ultimas] = await Promise.all([
    prisma.expediente.groupBy({ by: ['estado'], _count: { _all: true } }),
    prisma.visitaAuditoria.groupBy({ by: ['resultado'], _count: { _all: true } }),
    prisma.expediente.groupBy({ by: ['tipo_credito'], _count: { _all: true } }),
    prisma.asignacionAuditoria.count({ where: { estado: 'ACTIVA' } }),
    prisma.usuario.findMany({ where: { rol: 'AUDITOR', estado: 'ACTIVO' }, select: { id_usuario: true, nombres: true, apellidos: true, username: true, departamento: true } }),
    prisma.visitaAuditoria.findMany({ where: { fecha_hora_checkin: { gte: desde } }, select: { fecha_hora_checkin: true } }),
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
  ]);

  // Actividad por día (rellena los días sin visitas con 0 para que el gráfico no tenga huecos)
  const porDia = new Map();
  for (let i = 0; i < DIAS_ACTIVIDAD; i += 1) {
    const d = new Date(desde);
    d.setDate(desde.getDate() + i);
    porDia.set(d.toISOString().slice(0, 10), 0);
  }
  for (const v of recientes) {
    const clave = new Date(v.fecha_hora_checkin).toISOString().slice(0, 10);
    if (porDia.has(clave)) porDia.set(clave, porDia.get(clave) + 1);
  }

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
    },
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

export default { obtenerResumen };
