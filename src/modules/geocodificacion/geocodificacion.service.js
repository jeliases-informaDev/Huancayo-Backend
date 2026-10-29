// Ubica en el mapa las direcciones de los expedientes, en segundo plano, y deja cada resultado con su nivel de confianza.
// Regla central: la sugerencia de un proveedor NO es la referencia de la geocerca hasta que sea de confianza ALTA (punto exacto con el
// número y el distrito declarados) o la acepte una persona. Lo aproximado sirve para ver la zona y para navegar, nunca para validar.
import prisma from '#core/config/prisma.js';
import { logger } from '#core/config/logger.js';
import { estadoSegunResultado, SIN_SUGERENCIA as BORRAR_SUGERENCIA } from './direcciones.js';
import { esProveedorTemporal, geocodificarDireccion, pausaEntreConsultasMs, proveedorActivo, PROVEEDORES_TEMPORALES, sleep, tamanoMaximoLote } from './proveedores.js';
import { propagarUbicacionAVecinos } from './vecinos.js';
import { estadoGeoNegocios, negociosDe } from '#modules/expedientes/ubicaciones.js';

const LOTE_POR_DEFECTO = 5;
export const geocodificacionActiva = () => String(process.env.GEOCODING_WORKER_ENABLED ?? 'false').toLowerCase() === 'true';
const aplicarAlta = () => String(process.env.GEOCODING_APLICAR_ALTA ?? 'true').toLowerCase() !== 'false';

const SIN_SUGERENCIA = BORRAR_SUGERENCIA;

// Cuántos días vive una sugerencia de un proveedor temporal (Google permite 30 como máximo) y tope de consultas por mes (0 = sin tope).
const temporalDias = () => Math.min(Math.max(Number(process.env.GEOCODING_TEMPORAL_DIAS) || 30, 1), 30);
export const topeMensual = () => Math.max(Number(process.env.GEOCODING_MAX_MES ?? 10000) || 0, 0);
// Buscar solo los casos asignados a un auditor (lo que de verdad se va a visitar): así no se gasta en clientes que quizá nunca se visitan.
// Por defecto así con los proveedores de pago; con OpenStreetMap (gratis), toda la cola.
export const soloAsignados = (proveedor = proveedorActivo()) => {
  const v = process.env.GEOCODING_SOLO_ASIGNADOS;
  return v === undefined || v === '' ? proveedor !== 'nominatim' : String(v).toLowerCase() === 'true';
};
export const puedeConsultar = (consultas, tope = topeMensual()) => tope <= 0 || consultas < tope;
const mesDe = (fecha = new Date()) => fecha.toISOString().slice(0, 7);
export async function consultasDelMes(proveedor = proveedorActivo(), fecha = new Date()) {
  const fila = await prisma.geocodificacionConsumo.findUnique({ where: { proveedor_mes: { proveedor, mes: mesDe(fecha) } } });
  return fila?.consultas ?? 0;
}
export async function registrarConsultas(proveedor, n, fecha = new Date()) {
  if (!n) return;
  const mes = mesDe(fecha);
  await prisma.geocodificacionConsumo.upsert({ where: { proveedor_mes: { proveedor, mes } }, create: { proveedor, mes, consultas: n }, update: { consultas: { increment: n } } });
}

// Muchos clientes comparten domicilio: se reutiliza una ubicación ya confiable en vez de volver a consultar al proveedor externo.
function buscarUbicacionExistente(e) {
  if (!e.direccion_normalizada) return null;
  return prisma.expediente.findFirst({
    where: {
      id_expediente: { not: e.id_expediente }, direccion_normalizada: e.direccion_normalizada, distrito: e.distrito, provincia: e.provincia,
      geo_latitud: { not: null }, geo_estado: { in: ['LOCALIZADO', 'VERIFICADO'] }, geo_confianza: 'ALTA',
    },
    orderBy: { geo_fecha: 'desc' },
    select: { geo_latitud: true, geo_longitud: true, geo_precision: true, geo_direccion_encontrada: true, geo_proveedor: true },
  });
}

async function fijarComoReferencia(e, { latitud, longitud, proveedor }) {
  if (!aplicarAlta()) return false;
  if (esProveedorTemporal(proveedor)) return false; // sus coordenadas no pueden quedarse: solo sugerencia
  const r = await prisma.expediente.updateMany({ where: { id_expediente: e.id_expediente, latitud: null }, data: { latitud, longitud, ubicacion_origen: 'GEOCODIFICADA' } });
  if (!r.count) return false;
  await prisma.expedienteCambio.create({
    data: { id_expediente: e.id_expediente, tipo: 'UBICACION', cambios: { latitud: { antes: null, despues: latitud }, longitud: { antes: null, despues: longitud }, ubicacion_origen: { antes: null, despues: 'GEOCODIFICADA' }, proveedor } },
  });
  return true;
}

// Procesa un expediente: reutiliza una ubicación igual o consulta al proveedor, y guarda el resultado.
async function procesar(e, proveedor) {
  // Con un proveedor temporal no se copian sus coordenadas de un expediente a otro: cada caso pide la suya y vence sola.
  const existente = esProveedorTemporal(proveedor) ? null : await buscarUbicacionExistente(e);
  const ahora = new Date();
  if (existente) {
    await prisma.expediente.update({ where: { id_expediente: e.id_expediente }, data: { geo_estado: 'LOCALIZADO', geo_confianza: 'ALTA', geo_precision: existente.geo_precision, geo_proveedor: existente.geo_proveedor, geo_latitud: existente.geo_latitud, geo_longitud: existente.geo_longitud, geo_direccion_encontrada: existente.geo_direccion_encontrada, geo_fecha: ahora } });
    await fijarComoReferencia(e, { latitud: Number(existente.geo_latitud), longitud: Number(existente.geo_longitud), proveedor: 'reutilizada' });
    return { tipo: 'reutilizado', consulto: false };
  }
  const result = await geocodificarDireccion({ ...e, direccion: e.direccion_domicilio }, { proveedor });
  if (!result) {
    await prisma.expediente.update({ where: { id_expediente: e.id_expediente }, data: { geo_estado: 'NO_ENCONTRADO', ...SIN_SUGERENCIA, geo_fecha: ahora } });
    return { tipo: 'no_encontrado', consulto: true };
  }
  const estado = estadoSegunResultado(result);
  await prisma.expediente.update({
    where: { id_expediente: e.id_expediente },
    data: { geo_estado: estado, geo_confianza: result.confianza, geo_precision: result.precision, geo_proveedor: proveedor, geo_latitud: result.latitud, geo_longitud: result.longitud, geo_direccion_encontrada: result.direccionEncontrada, geo_fecha: ahora },
  });
  if (estado === 'LOCALIZADO' && result.confianza === 'ALTA') await fijarComoReferencia(e, { latitud: result.latitud, longitud: result.longitud, proveedor });
  return { tipo: estado === 'REVISAR' ? 'revisar' : result.confianza === 'ALTA' ? 'localizado' : 'aproximado', consulto: true };
}

// Los negocios/empleadores (en MYPE se visita el negocio) se ubican igual que el domicilio; el resultado queda dentro de cada negocio (negocio.geo)
// y solo un punto exacto (confianza ALTA) pasa a ser su referencia, marcado GEOCODIFICADA.
async function procesarNegocios(e, proveedor) {
  const negocios = negociosDe(e);
  const ahora = new Date().toISOString();
  const fijados = {};
  let consulto = false;
  let consultas = 0;
  const nuevos = [];
  for (const [i, n] of negocios.entries()) {
    if (!n?.direccion || n.latitud != null || n.geo) { nuevos.push(n); continue; }
    if (consulto) await sleep(pausaEntreConsultasMs(proveedor));
    const result = await geocodificarDireccion({ direccion: n.direccion, direccion_normalizada: n.direccion_normalizada, distrito: n.distrito || e.distrito, provincia: e.provincia, departamento: n.departamento || e.departamento }, { proveedor });
    consulto = true; consultas += 1;
    if (!result) { nuevos.push({ ...n, geo: { estado: 'NO_ENCONTRADO', proveedor, fecha: ahora } }); continue; }
    const estado = estadoSegunResultado(result);
    const geo = { estado, confianza: result.confianza, precision: result.precision, proveedor, latitud: result.latitud, longitud: result.longitud, direccion_encontrada: result.direccionEncontrada, fecha: ahora };
    if (estado === 'LOCALIZADO' && result.confianza === 'ALTA' && aplicarAlta() && !esProveedorTemporal(proveedor)) {
      nuevos.push({ ...n, geo, latitud: result.latitud, longitud: result.longitud, ubicacion_origen: 'GEOCODIFICADA' });
      fijados[`negocio_${i + 1}_latitud`] = { antes: null, despues: result.latitud };
      fijados[`negocio_${i + 1}_longitud`] = { antes: null, despues: result.longitud };
    } else {
      nuevos.push({ ...n, geo });
    }
  }
  await prisma.expediente.update({ where: { id_expediente: e.id_expediente }, data: { datos_negocio: { ...(e.datos_negocio || {}), negocios: nuevos }, geo_negocios_estado: 'LISTO', geo_negocios_fecha: new Date() } });
  if (Object.keys(fijados).length) await prisma.expedienteCambio.create({ data: { id_expediente: e.id_expediente, tipo: 'UBICACION', cambios: { ...fijados, proveedor } } });
  return { consulto, consultas };
}

// Las sugerencias de un proveedor temporal vencen: se borran y, si el caso sigue sin referencia, vuelve a la cola (se pedirá otra vez solo si está asignado).
// Las de los negocios viven dentro de cada negocio; la fecha de su búsqueda está en la columna geo_negocios_fecha.
export async function borrarSugerenciasVencidas({ ahora = new Date() } = {}) {
  const limite = new Date(ahora.getTime() - temporalDias() * 86400000);
  const temporales = [...PROVEEDORES_TEMPORALES];
  const sinReferencia = await prisma.expediente.updateMany({ where: { geo_proveedor: { in: temporales }, geo_fecha: { lt: limite }, latitud: null }, data: { ...SIN_SUGERENCIA, geo_estado: 'PENDIENTE' } });
  const conReferencia = await prisma.expediente.updateMany({ where: { geo_proveedor: { in: temporales }, geo_fecha: { lt: limite }, latitud: { not: null } }, data: { ...SIN_SUGERENCIA, geo_estado: null } });
  const filas = await prisma.expediente.findMany({ where: { geo_negocios_fecha: { lt: limite } }, select: { id_expediente: true, datos_negocio: true }, take: 500 });
  let negocios = 0;
  for (const fila of filas) {
    const lista = negociosDe(fila);
    if (!lista.some((n) => n?.geo && temporales.includes(n.geo.proveedor))) {
      await prisma.expediente.update({ where: { id_expediente: fila.id_expediente }, data: { geo_negocios_fecha: null } }); // nada temporal: no hace falta volver a mirarlo
      continue;
    }
    const nuevos = lista.map((n) => (n?.geo && temporales.includes(n.geo.proveedor) ? (({ geo, ...resto }) => resto)(n) : n));
    const datos = { ...fila.datos_negocio, negocios: nuevos };
    await prisma.expediente.update({ where: { id_expediente: fila.id_expediente }, data: { datos_negocio: datos, geo_negocios_estado: estadoGeoNegocios(datos), geo_negocios_fecha: null } });
    negocios += 1;
  }
  return { domicilios: sinReferencia.count + conReferencia.count, negocios };
}

const SELECT_COLA = { id_expediente: true, codigo_expediente: true, direccion_domicilio: true, distrito: true, provincia: true, departamento: true, direccion_normalizada: true, latitud: true, geo_estado: true, geo_negocios_estado: true, datos_negocio: true };

export async function geocodificarPendientes({ limit = LOTE_POR_DEFECTO } = {}) {
  const proveedor = proveedorActivo();
  // Tope mensual: si ya se gastó, no se consulta más hasta el mes siguiente (el panel lo muestra).
  const consumidas = await consultasDelMes(proveedor);
  if (!puedeConsultar(consumidas)) return { proveedor, procesados: 0, detenido: `Tope mensual de consultas alcanzado (${consumidas} de ${topeMensual()}).`, tope: true };
  const restantes = topeMensual() > 0 ? topeMensual() - consumidas : Infinity;
  const tope = Math.min(Math.max(Number(limit) || LOTE_POR_DEFECTO, 1), tamanoMaximoLote(proveedor), Math.max(1, Math.floor(restantes / 3))); // hasta 3 consultas por expediente (domicilio y dos negocios)
  const cola = await prisma.expediente.findMany({
    where: {
      // El domicilio en cola, o algún negocio/empleador todavía sin ubicar…
      OR: [{ geo_estado: 'PENDIENTE', direccion_normalizada: { not: null }, latitud: null }, { geo_negocios_estado: 'PENDIENTE' }],
      // …y, con un proveedor de pago, solo lo que ya está asignado a un auditor.
      ...(soloAsignados(proveedor) ? { asignaciones: { some: { estado: 'ACTIVA' } } } : {}),
    },
    select: SELECT_COLA, orderBy: { id_expediente: 'asc' }, take: tope,
  });
  let consultasLote = 0;
  const cuenta = { localizado: 0, aproximado: 0, revisar: 0, no_encontrado: 0, reutilizado: 0, negocios: 0, error: 0 };
  let detenido = null;
  for (const e of cola) {
    let consulto = false;
    try {
      if (e.geo_estado === 'PENDIENTE' && e.latitud == null && e.direccion_normalizada) {
        const r = await procesar(e, proveedor);
        cuenta[r.tipo] += 1; consulto = r.consulto; if (r.consulto) consultasLote += 1;
      }
      if (e.geo_negocios_estado === 'PENDIENTE') {
        const rn = await procesarNegocios(e, proveedor);
        cuenta.negocios += 1; consulto = consulto || rn.consulto; consultasLote += rn.consultas || 0;
      }
    } catch (error) {
      if (error.detenerLote) { detenido = error.message; logger.warn({ err: error, proveedor }, 'geocodificacion_lote_detenido'); break; }
      cuenta.error += 1; consulto = true;
      await prisma.expediente.update({ where: { id_expediente: e.id_expediente }, data: { geo_estado: 'ERROR', ...SIN_SUGERENCIA, geo_fecha: new Date() } }).catch(() => {});
      logger.error({ err: error, expediente: e.codigo_expediente }, 'geocodificacion_fallo');
    }
    if (consulto) await sleep(pausaEntreConsultasMs(proveedor)); // solo se espera cuando se consultó al proveedor externo
  }
  await registrarConsultas(proveedor, consultasLote).catch((error) => logger.warn({ err: error }, 'geocodificacion_consumo_no_registrado'));
  return { proveedor, procesados: Object.values(cuenta).reduce((a, b) => a + b, 0), ...cuenta, consultas: consultasLote, detenido };
}

// «Buscar de nuevo» desde el panel para un expediente puntual.
export async function geocodificarUno(id) {
  const e = await prisma.expediente.findUnique({ where: { id_expediente: id }, select: { ...SELECT_COLA, latitud: true } });
  if (!e) throw Object.assign(new Error('Expediente no encontrado'), { statusCode: 404 });
  if (!e.direccion_normalizada) throw Object.assign(new Error('El expediente no tiene dirección para buscar.'), { statusCode: 422, code: 'SIN_DIRECCION' });
  if (!geocodificacionActiva()) throw Object.assign(new Error('La búsqueda de direcciones en un proveedor de mapas está desactivada en este servidor.'), { statusCode: 409, code: 'GEOCODING_DISABLED' });
  const proveedor = proveedorActivo();
  if (!puedeConsultar(await consultasDelMes(proveedor))) throw Object.assign(new Error(`Se alcanzó el tope mensual de consultas al mapa (${topeMensual()}). Se puede subir con GEOCODING_MAX_MES.`), { statusCode: 409, code: 'TOPE_MENSUAL' });
  const r = await procesar(e, proveedor);
  let consultas = r.consulto ? 1 : 0;
  // De paso, los negocios/empleadores que falten (pueden seguir en cola aunque el domicilio ya esté ubicado).
  if (e.geo_negocios_estado === 'PENDIENTE') consultas += (await procesarNegocios(e, proveedor)).consultas || 0;
  await registrarConsultas(proveedor, consultas).catch((error) => logger.warn({ err: error }, 'geocodificacion_consumo_no_registrado'));
  return r.tipo;
}

// Una persona acepta la ubicación sugerida: pasa a ser la referencia (fijada «a mano») y queda verificada.
export async function aceptarSugerencia(id, actorId) {
  const e = await prisma.expediente.findUnique({ where: { id_expediente: id } });
  if (!e) throw Object.assign(new Error('Expediente no encontrado'), { statusCode: 404 });
  if (e.geo_latitud == null || e.geo_longitud == null) throw Object.assign(new Error('Este expediente no tiene una ubicación sugerida.'), { statusCode: 422, code: 'SIN_SUGERENCIA' });
  if (esProveedorTemporal(e.geo_proveedor)) {
    throw Object.assign(new Error('Esta sugerencia es temporal (Google): no puede quedar como referencia. La fija la primera visita del auditor o una ubicación puesta a mano.'), { statusCode: 422, code: 'SUGERENCIA_TEMPORAL' });
  }
  const latitud = Number(e.geo_latitud); const longitud = Number(e.geo_longitud);
  const actualizado = await prisma.expediente.update({ where: { id_expediente: id }, data: { latitud, longitud, ubicacion_origen: 'MANUAL', geo_estado: 'VERIFICADO' } });
  await prisma.expedienteCambio.create({
    data: { id_expediente: id, actor_id: actorId || null, tipo: 'UBICACION', cambios: { latitud: { antes: e.latitud == null ? null : Number(e.latitud), despues: latitud }, longitud: { antes: e.longitud == null ? null : Number(e.longitud), despues: longitud }, ubicacion_origen: { antes: e.ubicacion_origen, despues: 'MANUAL' }, sugerencia_aceptada: true } },
  });
  // Una ubicación aceptada por una persona vale como verificada: ubica a los vecinos de su manzana y de su zona.
  await propagarUbicacionAVecinos(id, { actorId });
  return { antes: e, despues: actualizado };
}

// Cuántas direcciones hay en cada situación (para el resumen de calidad del panel).
export async function resumenGeocodificacion() {
  const filas = await prisma.expediente.groupBy({ by: ['geo_estado', 'geo_confianza'], _count: { _all: true } });
  const conBase = await prisma.expediente.count({ where: { latitud: { not: null }, ubicacion_origen: { in: ['REFERENCIA', 'MANUAL', 'PRIMERA_VISITA'] } } });
  const total = await prisma.expediente.count();
  const n = (estado, confianza) => filas.filter((f) => f.geo_estado === estado && (confianza === undefined || f.geo_confianza === confianza)).reduce((a, f) => a + f._count._all, 0);
  const sinDireccion = await prisma.expediente.count({ where: { direccion_normalizada: null } });
  const geocodificadasAlta = await prisma.expediente.count({ where: { ubicacion_origen: 'GEOCODIFICADA' } });
  const porVecinos = await prisma.expediente.count({ where: { ubicacion_origen: 'MANZANA_VECINA' } });
  const negociosPendientes = await prisma.expediente.count({ where: { geo_negocios_estado: 'PENDIENTE' } });
  return {
    total, con_ubicacion_de_la_base_o_persona: conBase, geocodificadas_como_referencia: geocodificadasAlta, por_manzana_vecina: porVecinos, negocios_pendientes: negociosPendientes,
    pendientes: n('PENDIENTE'), aproximadas: n('LOCALIZADO') - n('LOCALIZADO', 'ALTA'), precisas: n('LOCALIZADO', 'ALTA'), por_revisar: n('REVISAR'),
    no_encontradas: n('NO_ENCONTRADO'), con_error: n('ERROR'), verificadas: n('VERIFICADO'), sin_direccion: sinDireccion,
    activa: geocodificacionActiva(), proveedor: proveedorActivo(), temporal: esProveedorTemporal(proveedorActivo()), vence_dias: temporalDias(),
    solo_asignados: soloAsignados(), consultas_mes: await consultasDelMes(), tope_mes: topeMensual(),
  };
}

// Vuelve a poner en cola las direcciones que fallaron o no se encontraron (p. ej. tras cambiar de proveedor).
export async function reencolarFallidas() {
  const r = await prisma.expediente.updateMany({ where: { geo_estado: { in: ['ERROR', 'NO_ENCONTRADO'] }, latitud: null, direccion_normalizada: { not: null } }, data: { geo_estado: 'PENDIENTE' } });
  return r.count;
}
