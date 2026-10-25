import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { modoPruebasActivo } from '#modules/sistema/configuracion.service.js';
import { CATEGORIAS, PLURAL_CRITICO, clasificar } from './seguridad.catalogo.js';
import {
  COLUMNAS_CSV, VENTANAS_HORAS, codificarCursor, construirFiltro, decodificarCursor, despuesDelCursor, esUuid, filaCsv,
} from './seguridad.filtros.js';

const ORDEN = [{ fecha: 'desc' }, { id_auditoria: 'desc' }];
const HORA = 60 * 60 * 1000;
const ACCESOS_RECHAZADOS = ['ACCESO_FALLIDO', 'ACCESO_BLOQUEADO', 'ACCESO_LIMITE'];
// Hasta cuántos registros se cuentan de golpe: más allá se dice «más de N» en vez de recorrer millones de filas para dar un número exacto.
const TOPE_CONTEO = 10_000;

// Las cifras y los avisos se calculan con consultas sobre rangos largos: se guardan 30 s por empresa, así abrir la pantalla varias veces (o varias
// personas a la vez) no repite el cálculo.
const CACHE_MS = 30_000;
const cache = new Map();
async function conCache(clave, calcular, { fresco = false } = {}) {
  const k = `${empresaActual()}|${clave}`;
  const hit = cache.get(k);
  if (!fresco && hit && Date.now() - hit.en < CACHE_MS) return hit.valor;
  const valor = await calcular();
  cache.set(k, { valor, en: Date.now() });
  if (cache.size > 200) for (const [clave2, v] of cache) if (Date.now() - v.en >= CACHE_MS) cache.delete(clave2);
  return valor;
}

const nombreCompleto = (u) => [u?.nombres, u?.apellidos].filter(Boolean).join(' ') || null;
const errorHttp = (mensaje, statusCode, code) => Object.assign(new Error(mensaje), { statusCode, ...(code ? { code } : {}) });

// Quién y qué recibió la acción, de las filas de una página: cuentas (quien actuó y quien recibió) y expedientes. Dos consultas por página como máximo,
// con los identificadores ya conocidos: nunca una por fila.
async function resolverNombres(filas) {
  const usuarios = new Set(); const expedientes = new Set();
  for (const f of filas) {
    if (f.actor_id && esUuid(f.actor_id)) usuarios.add(f.actor_id);
    if (f.entidad === 'Usuario' && esUuid(f.entidad_id)) usuarios.add(f.entidad_id);
    if (f.entidad === 'Expediente' && /^\d+$/.test(f.entidad_id || '')) expedientes.add(Number(f.entidad_id));
  }
  const [u, e] = await Promise.all([
    usuarios.size ? prisma.usuario.findMany({ where: { id_usuario: { in: [...usuarios] } }, select: { id_usuario: true, username: true, nombres: true, apellidos: true } }) : [],
    expedientes.size ? prisma.expediente.findMany({ where: { id_expediente: { in: [...expedientes] } }, select: { id_expediente: true, codigo_expediente: true } }) : [],
  ]);
  return {
    usuarios: new Map(u.map((x) => [x.id_usuario, x])),
    expedientes: new Map(e.map((x) => [String(x.id_expediente), x.codigo_expediente])),
  };
}

// Una fila del registro lista para mostrar: lo guardado más el texto de lo que pasó, la categoría y el nombre de las personas.
function presentar({ ip_hash: _huella, ...f }, nombres) {
  const receptor = f.entidad === 'Usuario' ? nombres.usuarios.get(f.entidad_id) : null;
  const codigo = f.entidad === 'Expediente' ? nombres.expedientes.get(f.entidad_id) : null;
  const objetivo = receptor ? `@${receptor.username}` : (codigo ? `el expediente ${codigo}` : null);
  const clase = clasificar({ metodo: f.metodo, ruta: f.ruta, estado: f.estado_http, anterior: f.valor_anterior, nuevo: f.valor_nuevo, objetivo });
  const autor = f.actor_id ? nombres.usuarios.get(f.actor_id) : null;
  const categoria = f.categoria || clase.categoria;
  return {
    ...f,
    accion: f.accion || clase.accion, categoria, categoria_texto: CATEGORIAS[categoria] || categoria,
    severidad: f.severidad || clase.severidad, titulo: clase.titulo,
    actor_nombre: nombreCompleto(autor), objetivo,
    resultado: f.estado_http < 400 ? 'ok' : 'error',
  };
}

// «N registros» sin recorrer toda la tabla: se cuenta solo si el rango de fechas es corto, y hasta un tope.
async function contarAcotado(where, consulta) {
  if (!consulta.desde) return null;
  const hasta = consulta.hasta ? Date.parse(consulta.hasta) : Date.now();
  if (Number.isNaN(hasta) || hasta - Date.parse(consulta.desde) > 62 * 24 * HORA) return null;
  const ids = await prisma.auditoriaSeguridad.findMany({ where, select: { id_auditoria: true }, take: TOPE_CONTEO + 1 });
  return { cantidad: Math.min(ids.length, TOPE_CONTEO), mas: ids.length > TOPE_CONTEO };
}

// El registro, por páginas con cursor (la siguiente página nace de la última fila vista, sin saltar ni contar lo anterior). `page` se sigue aceptando
// para los clientes anteriores.
async function listar(consulta = {}) {
  const limit = consulta.limit ?? 50;
  const base = construirFiltro(consulta);
  let where = base;
  let skip = 0;
  if (consulta.cursor) {
    const cursor = decodificarCursor(consulta.cursor);
    if (!cursor) throw errorHttp('La posición de la lista no es válida: vuelve a cargarla.', 400, 'CURSOR_INVALIDO');
    where = { AND: [base, despuesDelCursor(cursor)] };
  } else if (consulta.page > 1) {
    skip = (consulta.page - 1) * limit;
  }
  const filas = await prisma.auditoriaSeguridad.findMany({ where, orderBy: ORDEN, take: limit + 1, skip });
  const hayMas = filas.length > limit;
  const pagina = hayMas ? filas.slice(0, limit) : filas;
  const nombres = await resolverNombres(pagina);
  const ultima = pagina[pagina.length - 1];
  const total = consulta.contar === 'true' ? await contarAcotado(base, consulta) : null;
  return {
    data: pagina.map((f) => presentar(f, nombres)),
    siguiente: hayMas && ultima ? codificarCursor(ultima.fecha, ultima.id_auditoria) : null,
    ...(total ? { total: total.cantidad, total_es_minimo: total.mas } : {}),
  };
}

// Las cifras de arriba de la pantalla. Las llaves anteriores se mantienen (ventana_horas, total_eventos, errores, fallos_autenticacion, cuentas_bloqueadas).
// `fresco`: se salta la caché (el botón «Actualizar» de la pantalla).
function metricas({ ventana = '24h', fresco = 'false' } = {}) {
  return conCache(`metricas:${ventana}`, () => calcularMetricas(ventana), { fresco: fresco === 'true' });
}
async function calcularMetricas(ventana) {
  const horas = VENTANAS_HORAS[ventana] || 24;
  const desde = new Date(Date.now() - horas * HORA);
  const rango = { fecha: { gte: desde } };
  const hace30d = new Date(Date.now() - 30 * 24 * HORA);
  const [total, errores, rechazados, rechazadosViejos, criticas, bloqueadas, oficina, inactivos] = await Promise.all([
    prisma.auditoriaSeguridad.count({ where: rango }),
    prisma.auditoriaSeguridad.count({ where: { ...rango, estado_http: { gte: 400 } } }),
    prisma.auditoriaSeguridad.count({ where: { ...rango, categoria: 'ACCESO', accion: { in: ACCESOS_RECHAZADOS } } }),
    // los registros anteriores a la clasificación no traen acción: se reconocen por su ruta y su código, como antes
    prisma.auditoriaSeguridad.count({ where: { ...rango, accion: null, ruta: { startsWith: '/api/auth' }, estado_http: { gte: 400 } } }),
    prisma.auditoriaSeguridad.count({ where: { ...rango, severidad: 'CRITICO' } }),
    prisma.usuario.count({ where: { bloqueado_hasta: { gt: new Date() } } }),
    prisma.usuario.groupBy({ by: ['mfa_habilitado'], where: { estado: 'ACTIVO', rol: { in: ['ADMINISTRADOR', 'SUPERVISOR'] } }, _count: { _all: true } }),
    prisma.usuario.count({ where: { estado: 'ACTIVO', OR: [{ ultimo_acceso: null }, { ultimo_acceso: { lt: hace30d } }] } }),
  ]);
  const conMfa = oficina.find((o) => o.mfa_habilitado)?._count._all || 0;
  const sinMfa = oficina.find((o) => !o.mfa_habilitado)?._count._all || 0;
  return {
    ventana, ventana_horas: horas, total_eventos: total, errores, fallos_autenticacion: rechazados + rechazadosViejos,
    operaciones_criticas: criticas, cuentas_bloqueadas: bloqueadas,
    postura: { oficina_total: conMfa + sinMfa, oficina_con_mfa: conMfa, cuentas_sin_entrar_30d: inactivos },
    retencion_dias: env.AUDITORIA_RETENCION_DIAS,
  };
}

// «Requiere atención»: lo que un administrador debería mirar hoy, calculado en el momento (sin tabla aparte). Cada aviso trae, si se puede, el filtro
// del registro que lo explica.
function alertas({ fresco = 'false' } = {}) {
  return conCache('alertas', calcularAlertas, { fresco: fresco === 'true' });
}
async function calcularAlertas() {
  const ahora = Date.now();
  const hace24h = new Date(ahora - 24 * HORA);
  const hace7d = new Date(ahora - 7 * 24 * HORA);
  const [rechazados, criticos, bloqueadas, sinMfa, gpsFalso, modoPruebas] = await Promise.all([
    prisma.auditoriaSeguridad.groupBy({ by: ['actor'], where: { fecha: { gte: hace24h }, categoria: 'ACCESO', accion: { in: ACCESOS_RECHAZADOS } }, _count: { _all: true }, _max: { fecha: true } }),
    prisma.auditoriaSeguridad.groupBy({ by: ['accion'], where: { fecha: { gte: hace7d }, severidad: 'CRITICO' }, _count: { _all: true }, _max: { fecha: true } }),
    prisma.usuario.findMany({ where: { bloqueado_hasta: { gt: new Date() } }, select: { username: true, bloqueado_hasta: true }, orderBy: { bloqueado_hasta: 'desc' }, take: 10 }),
    prisma.usuario.count({ where: { estado: 'ACTIVO', rol: { in: ['ADMINISTRADOR', 'SUPERVISOR'] }, mfa_habilitado: false } }),
    prisma.visitaAuditoria.count({ where: { mock_location: true, fecha_hora_checkin: { gte: hace7d } } }),
    modoPruebasActivo(),
  ]);
  const lista = [];
  for (const r of rechazados) {
    const n = r._count._all;
    if (n < 5) continue;
    lista.push({
      id: `acceso-fallido:${r.actor}`, tipo: 'ACCESOS_FALLIDOS', severidad: n >= 10 ? 'CRITICO' : 'AVISO',
      titulo: `${n} intentos de acceso rechazados a «${r.actor}» en las últimas 24 horas`,
      detalle: 'Puede ser alguien adivinando la contraseña. Si la cuenta es real, conviene cambiarla.',
      ultima: r._max.fecha, filtro: { categoria: 'ACCESO', actor: r.actor, desde: hace24h.toISOString() },
    });
  }
  for (const c of criticos) {
    const n = c._count._all;
    lista.push({
      id: `critica:${c.accion}`, tipo: 'OPERACION_CRITICA', severidad: 'CRITICO',
      titulo: `${n} ${PLURAL_CRITICO[c.accion] || c.accion} en los últimos 7 días`, ultima: c._max.fecha,
      filtro: { accion: c.accion, desde: hace7d.toISOString() },
    });
  }
  if (modoPruebas) {
    lista.push({ id: 'modo-pruebas', tipo: 'MODO_PRUEBAS', severidad: 'AVISO', titulo: 'El modo pruebas está encendido', detalle: 'Mientras esté encendido se pueden borrar empleados y datos. Apágalo al terminar.', ancla: 'modo-pruebas' });
  }
  if (bloqueadas.length) {
    lista.push({
      id: 'cuentas-bloqueadas', tipo: 'CUENTAS_BLOQUEADAS', severidad: 'AVISO',
      titulo: `${bloqueadas.length === 1 ? '1 cuenta bloqueada' : `${bloqueadas.length} cuentas bloqueadas`} por intentos fallidos`,
      detalle: bloqueadas.map((b) => `@${b.username}`).join(', '), ultima: bloqueadas[0].bloqueado_hasta, filtro: { accion: 'ACCESO_BLOQUEADO' },
    });
  }
  if (sinMfa > 0) {
    lista.push({
      id: 'sin-mfa', tipo: 'SIN_MFA', severidad: 'AVISO',
      titulo: `${sinMfa === 1 ? '1 cuenta de oficina' : `${sinMfa} cuentas de oficina`} sin verificación en dos pasos`,
      detalle: 'Las cuentas de administradores y supervisores deberían tenerla activa.', enlace: '/usuarios',
    });
  }
  if (gpsFalso > 0) {
    lista.push({
      id: 'gps-falso', tipo: 'GPS_SIMULADO', severidad: 'AVISO',
      titulo: `${gpsFalso === 1 ? '1 visita' : `${gpsFalso} visitas`} con ubicación simulada en los últimos 7 días`,
      detalle: 'El celular avisó que la posición no era real (GPS falso).', enlace: '/visitas?alertas=1',
    });
  }
  const peso = { CRITICO: 0, AVISO: 1, INFO: 2 };
  lista.sort((a, b) => peso[a.severidad] - peso[b.severidad] || String(b.ultima || '').localeCompare(String(a.ultima || '')));
  return { data: lista, generado: new Date().toISOString() };
}

// Exporta el registro filtrado a CSV, por lotes con el mismo cursor, sin cargarlo entero en memoria y sin tope de filas (el rango de fechas lo acota).
// `escribir(texto)` devuelve una promesa que se resuelve cuando se puede seguir escribiendo; `cancelado()` avisa si el cliente cortó la descarga.
async function exportarCsv(consulta, { escribir, cancelado = () => false, lote = 2000 }) {
  const base = construirFiltro(consulta);
  await escribir('﻿' + filaCsv(COLUMNAS_CSV));
  let cursor = null; let filas = 0;
  for (;;) {
    if (cancelado()) break;
    const where = cursor ? { AND: [base, despuesDelCursor(cursor)] } : base;
    const pagina = await prisma.auditoriaSeguridad.findMany({ where, orderBy: ORDEN, take: lote });
    if (!pagina.length) break;
    const nombres = await resolverNombres(pagina);
    let texto = '';
    for (const f of pagina) {
      const v = presentar(f, nombres);
      texto += filaCsv([
        v.fecha.toISOString(), v.actor, v.actor_nombre, v.rol, v.titulo, v.categoria_texto, v.severidad, v.resultado === 'ok' ? 'Correcto' : 'Rechazado', v.estado_http,
        v.metodo, v.ruta, v.ip_address, v.plataforma, v.device_id, v.entidad, v.entidad_id, v.request_id, v.valor_anterior, v.valor_nuevo, v.secuencia, v.sello,
      ]);
    }
    await escribir(texto);
    filas += pagina.length;
    const ultima = pagina[pagina.length - 1];
    cursor = { fecha: ultima.fecha, id: ultima.id_auditoria };
    if (pagina.length < lote) break;
  }
  return { filas };
}

export default { listar, metricas, alertas, exportarCsv };
