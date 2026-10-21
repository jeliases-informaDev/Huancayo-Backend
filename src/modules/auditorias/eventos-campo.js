// Avisos de llegada y salida: mientras el auditor está en jornada, cada posición que llega se compara con los puntos
// de sus casos (domicilio y negocios con coordenadas). Entrar a la geocerca = LLEGADA; alejarse más de 1,5 veces el
// radio = SALIDA (el margen evita que un GPS que «baila» en el borde genere llegadas y salidas falsas).
import prisma from '#core/config/prisma.js';
import { reglas as reglasEmpresa } from '#modules/empresas/empresas.service.js';
import { puntosDeCaso, decidirEventos, claveDe } from './eventos-campo.logica.js';

const inicioDelDia = (fecha) => (fecha ? new Date(`${fecha}T00:00:00`) : new Date(new Date().toDateString()));
const nombreCompleto = (u) => [u?.nombres, u?.apellidos].filter(Boolean).join(' ') || u?.username || '';

function filaParaPanel(e) {
  return {
    id: String(e.id_evento), tipo: e.tipo, fecha: e.registrado_en.toISOString(), distancia_m: e.distancia_m != null ? Number(e.distancia_m) : null,
    id_usuario: e.id_usuario, auditor: nombreCompleto(e.usuario),
    id_expediente: e.id_expediente, codigo_expediente: e.expediente?.codigo_expediente ?? null, cliente: e.expediente?.nombres_cliente ?? null,
    punto: e.punto, direccion: e.expediente ? [e.expediente.direccion_domicilio, e.expediente.distrito].filter(Boolean).join(', ') || null : null,
  };
}
const incluir = { usuario: { select: { username: true, nombres: true, apellidos: true } }, expediente: { select: { codigo_expediente: true, nombres_cliente: true, direccion_domicilio: true, distrito: true } } };

// Los puntos de los casos de un auditor (domicilios y negocios con coordenadas) casi no cambian entre una posición y la siguiente, y
// leerlos de la base en cada una (con sus bloques JSON) era lo más caro de cada posición. Se guardan en memoria por auditor durante
// 60 s y se descartan al instante cuando cambian sus asignaciones o se registra una visita (invalidarPuntos).
const PUNTOS_TTL_MS = 60_000;
const PUNTOS_MAX_AUDITORES = 5000;
const cachePuntos = new Map(); // id del auditor → { en, dia, puntos }
export function invalidarPuntos() { cachePuntos.clear(); }

async function puntosDelAuditor(usuarioId, desde) {
  const hit = cachePuntos.get(usuarioId);
  const ahora = Date.now();
  if (hit && ahora - hit.en < PUNTOS_TTL_MS && hit.dia === desde.getTime()) return hit.puntos;
  const asignaciones = await prisma.asignacionAuditoria.findMany({
    where: { id_usuario_auditor: usuarioId, OR: [{ estado: 'ACTIVA' }, { estado: 'FINALIZADA', fecha_fin: { gte: desde } }] },
    select: { estado: true, expediente: { select: { id_expediente: true, tipo_credito: true, direccion_domicilio: true, distrito: true, latitud: true, longitud: true, ubicacion_origen: true, datos_negocio: true } } },
  });
  const puntos = asignaciones.flatMap((a) => puntosDeCaso(a.expediente, { soloSalida: a.estado !== 'ACTIVA' }));
  if (cachePuntos.size >= PUNTOS_MAX_AUDITORES) { for (const [k, v] of cachePuntos) if (ahora - v.en >= PUNTOS_TTL_MS) cachePuntos.delete(k); if (cachePuntos.size >= PUNTOS_MAX_AUDITORES) cachePuntos.clear(); }
  cachePuntos.set(usuarioId, { en: ahora, dia: desde.getTime(), puntos });
  return puntos;
}

// Compara la posición con los casos del auditor, guarda los avisos nuevos y los devuelve listos para el panel.
// Las asignaciones ya cerradas hoy solo pueden producir la SALIDA (el auditor terminó la visita y se retira).
export async function registrarEventosDeCampo(usuarioId, { latitud, longitud, precision = null, simulada = false }) {
  const radio = (await reglasEmpresa()).geocerca_radio_m;
  if (simulada || (precision !== null && precision > radio)) return [];
  const desde = inicioDelDia();
  const puntos = await puntosDelAuditor(usuarioId, desde);
  if (!puntos.length) return [];
  const previos = await prisma.eventoCampo.findMany({
    where: { id_usuario: usuarioId, registrado_en: { gte: desde }, id_expediente: { in: [...new Set(puntos.map((p) => p.id_expediente))] } },
    orderBy: { id_evento: 'desc' }, select: { id_expediente: true, punto: true, tipo: true },
  });
  const ultimo = new Map();
  for (const p of previos) { const k = claveDe(p.id_expediente, p.punto); if (!ultimo.has(k)) ultimo.set(k, p.tipo); }
  const dentro = new Set([...ultimo].filter(([, tipo]) => tipo === 'LLEGADA').map(([k]) => k));
  const nuevos = decidirEventos({ latitud, longitud, precision, simulada, puntos, dentro, radio });
  const guardados = [];
  for (const n of nuevos) {
    const fila = await prisma.eventoCampo.create({ data: { id_usuario: usuarioId, id_expediente: n.id_expediente, punto: n.punto, tipo: n.tipo, distancia_m: n.distancia_m, latitud, longitud }, include: incluir });
    guardados.push(filaParaPanel(fila));
  }
  return guardados;
}

// Avisos de un día (hoy por defecto) de todo el personal de campo, del más reciente al más antiguo.
export async function listarEventos(fecha) {
  const desde = inicioDelDia(fecha);
  const filas = await prisma.eventoCampo.findMany({
    where: { registrado_en: { gte: desde, lt: new Date(desde.getTime() + 24 * 60 * 60 * 1000) } },
    orderBy: { id_evento: 'desc' }, take: 300, include: incluir,
  });
  return filas.map(filaParaPanel);
}
