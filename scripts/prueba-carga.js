// Prueba de CARGA de la ubicación en tiempo real, hecha para correr dentro del servidor (también sirve en una PC con la base local).
//
// Qué hace: crea una empresa APARTE («prueba-carga-…») con N asesores "en jornada" y sus casos asignados, hace que cada uno mande su posición como la app real
// (PATCH /api/visitas/ubicacion cada ~10 s), mientras S supervisores miran el mapa (un socket que recibe los avisos y el refresco de /api/usuarios/ubicaciones cada 10 s),
// y al terminar BORRA la empresa de prueba con todo lo suyo. Nunca toca los datos de ninguna otra empresa: todo lo que crea y borra lleva el id de la empresa de prueba.
//
// Dentro del servidor (la imagen ya trae este archivo; usa la red de la base y la clave de firma del propio servidor, que no se imprime):
//   docker run --rm --network sulotec_data --env-file /opt/sulotec/auditoria.env auditoria-api:latest node scripts/prueba-carga.js --api http://auditoria-api:4100 --asesores 100 --segundos 60
// En una PC con la base local:  node scripts/prueba-carga.js --api http://localhost:4100 --asesores 300 --segundos 60
//
// Opciones: --asesores 100  --segundos 60  --supervisores 3  --intervalo 10 (segundos entre posiciones de cada asesor)  --asignaciones 20 (casos por asesor)
//           --api http://auditoria-api:4100  --sin-limpiar (deja la empresa para mirar; se borra en la próxima corrida)  --corte 20 (se detiene si más de ese % de las peticiones falla)
// Cada asesor manda su propia IP en x-forwarded-for, como llegan detrás de Cloudflare: si el servidor NO tiene TRUST_PROXY=true, todos cuentan como una sola IP y el límite
// de 1 200 peticiones por IP cada 15 minutos corta la prueba con 429 (eso mismo avisa del problema; no afecta a nadie más: la IP de esta prueba es otra).
import crypto from 'node:crypto';
import os from 'node:os';
import { readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { conEmpresa, sinEmpresa } from '#core/tenant/contexto.js';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); if (i < 0) return d; const v = process.argv[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const N = Math.max(1, Math.min(3000, Number(arg('asesores', 100)))); const SEG = Math.max(10, Number(arg('segundos', 60))); const SUP = Math.max(0, Math.min(50, Number(arg('supervisores', 3))));
const INT = Math.max(1, Number(arg('intervalo', 10))); const ASIG = Math.max(1, Math.min(100, Number(arg('asignaciones', 20)))); const CORTE = Number(arg('corte', 20));
const API = String(arg('api', 'http://localhost:4100')).replace(/\/$/, ''); const LIMPIAR = !arg('sin-limpiar', false);
const PREFIJO_SLUG = 'prueba-carga-';
const pad = (i) => String(i).padStart(4, '0');

// ---------------------------------------------------------------- la empresa de prueba y su limpieza (siempre por id de empresa)
// El orden respeta las relaciones: primero lo que cuelga de otras filas.
const TABLAS = ['evidencia', 'visitaAuditoria', 'eventoCampo', 'trackingUbicacion', 'asignacionAuditoria', 'expedienteCambio', 'expediente', 'importacionMasiva', 'auditoriaSeguridad',
  'configuracionSistema', 'dispositivoAutorizado', 'aceptacionTerminos', 'jornadaCampo', 'usuario'];
async function borrarEmpresa(id) {
  for (const tabla of TABLAS) {
    if (tabla === 'trackingUbicacion') {
      // El recorrido crece rápido (una fila por posición): se borra por tandas de 5 000 para no dejar la base trabada.
      for (let vuelta = 0; vuelta < 10000; vuelta += 1) { if (!(await prisma.$executeRaw`DELETE FROM tracking_ubicacion WHERE empresa_id = ${id} LIMIT 5000`)) break; }
    } else await sinEmpresa(() => prisma[tabla].deleteMany({ where: { empresa_id: id } }));
  }
  await sinEmpresa(() => prisma.empresa.delete({ where: { id_empresa: id } }));
}
async function borrarRestos() {
  const restos = await sinEmpresa(() => prisma.empresa.findMany({ where: { slug: { startsWith: PREFIJO_SLUG } }, select: { id_empresa: true, slug: true } }));
  for (const e of restos) { try { await borrarEmpresa(e.id_empresa); console.log(`Se borró una empresa de prueba que había quedado de antes (${e.slug}).`); } catch (x) { console.log(`No pude borrar ${e.slug}: ${String(x.message).slice(0, 120)}`); } }
}

const asesores = []; // { id, username, lat, lon, token }
let empresaId = null; let adminId = null; let adminUser = null;
async function preparar() {
  await borrarRestos();
  const sufijo = Date.now().toString(36);
  const empresa = await sinEmpresa(() => prisma.empresa.create({ data: { nombre: `Prueba de carga ${sufijo}`, nombre_corto: 'Carga', slug: PREFIJO_SLUG + sufijo, estado: 'ACTIVA' } }));
  empresaId = empresa.id_empresa;
  console.log(`Empresa de prueba creada (${empresa.slug}). Preparando ${N} asesores con ${ASIG} casos cada uno…`);
  const ahora = new Date(); const hash = '$2b$12$cargaDePruebaNoSeUsaParaIniciarSesion.....................';
  adminId = crypto.randomUUID(); adminUser = 'carga.admin.' + sufijo;
  const usuarios = [{ id_usuario: adminId, empresa_id: empresaId, username: adminUser, nombres: 'Carga', apellidos: 'Administrador', password_hash: hash, rol: 'ADMINISTRADOR', estado: 'ACTIVO', mfa_exento: true }];
  const expedientes = [];
  for (let i = 0; i < N; i += 1) {
    const id = crypto.randomUUID(); const lat = -12.065 + (Math.random() - 0.5) * 0.1; const lon = -75.21 + (Math.random() - 0.5) * 0.1;
    asesores.push({ id, username: `carga.${sufijo}.${pad(i)}`, lat, lon });
    usuarios.push({ id_usuario: id, empresa_id: empresaId, username: `carga.${sufijo}.${pad(i)}`, nombres: 'Carga', apellidos: pad(i), password_hash: hash, rol: 'AUDITOR', estado: 'ACTIVO', jornada_inicio: ahora, mfa_exento: true });
    for (let k = 0; k < ASIG; k += 1) {
      const cerca = k === 0; // un caso casi encima del asesor: así también se generan llegadas y salidas
      expedientes.push({
        empresa_id: empresaId, codigo_expediente: `LOAD-${pad(i)}-${String(k).padStart(2, '0')}`, tipo_credito: k % 2 ? 'OTROS' : 'CONSUMO', numero_documento_cliente: `7${pad(i)}${String(k).padStart(2, '0')}`.slice(0, 8),
        nombres_cliente: `Cliente carga ${pad(i)}-${k}`, asesor_responsable: 'Asesor carga', direccion_domicilio: 'Av. Real 123', distrito: 'Huancayo', provincia: 'Huancayo', departamento: 'Junin',
        latitud: cerca ? lat + 0.0003 : lat + (Math.random() - 0.5) * 0.06, longitud: cerca ? lon : lon + (Math.random() - 0.5) * 0.06, estado: 'ASIGNADO',
        datos_negocio: k % 2 ? { actividad: 'Bodega', negocios: [{ direccion: 'Mercado Modelo puesto 3', distrito: 'Huancayo', latitud: lat + (Math.random() - 0.5) * 0.06, longitud: lon + (Math.random() - 0.5) * 0.06, ubicacion_origen: 'MANUAL' }, { direccion: 'Jr. Ancash 450', distrito: 'El Tambo' }], observaciones: 'x'.repeat(600) } : undefined,
      });
    }
  }
  await conEmpresa(empresaId, async () => {
    for (let i = 0; i < usuarios.length; i += 500) await prisma.usuario.createMany({ data: usuarios.slice(i, i + 500) });
    for (let i = 0; i < expedientes.length; i += 1000) await prisma.expediente.createMany({ data: expedientes.slice(i, i + 1000) });
    const ids = await prisma.expediente.findMany({ select: { id_expediente: true, codigo_expediente: true } });
    const porCodigo = new Map(ids.map((r) => [r.codigo_expediente, r.id_expediente]));
    const asignaciones = [];
    for (let i = 0; i < N; i += 1) for (let k = 0; k < ASIG; k += 1) asignaciones.push({ empresa_id: empresaId, id_expediente: porCodigo.get(`LOAD-${pad(i)}-${String(k).padStart(2, '0')}`), id_usuario_auditor: asesores[i].id, estado: 'ACTIVA', prioridad: 'MEDIA', origen: 'SUPERVISOR' });
    for (let i = 0; i < asignaciones.length; i += 1000) await prisma.asignacionAuditoria.createMany({ data: asignaciones.slice(i, i + 1000) });
  });
  // La empresa se lee con una caché corta: se la pide una vez para que la API ya la tenga al empezar.
  const firmar = (u, rol, canal) => jwt.sign({ username: u.username, rol, channel: canal, type: 'access', ver: 0, emp: empresaId }, env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256', issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE, subject: u.id, jwtid: crypto.randomUUID() });
  asesores.forEach((a) => { a.token = firmar(a, 'AUDITOR', 'mobile'); });
  console.log('Datos de prueba listos.');
  return firmar({ id: adminId, username: adminUser }, 'ADMINISTRADOR', 'web');
}

// ---------------------------------------------------------------- medición
const pct = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))] : 0);
const nuevaVentana = () => ({ lat: [], ok: 0, err: {}, t0: Date.now() });
let ventana = nuevaVentana(); const total = { lat: [], ok: 0, err: {} };
let corriendo = true; let cortada = false;
const marcar = (ms, status) => { for (const b of [ventana, total]) { if (status === 200) { b.ok += 1; b.lat.push(ms); } else b.err[status] = (b.err[status] || 0) + 1; } };
const ipDe = (i) => `10.${(i >> 8) & 255}.${i & 255}.7`;

async function ping(a, i) {
  a.rumbo = (a.rumbo ?? Math.random() * 6.28) + (Math.random() - 0.5) * 0.6; a.lat += Math.sin(a.rumbo) * 0.0002; a.lon += Math.cos(a.rumbo) * 0.0002;
  const cuerpo = JSON.stringify({ latitud: Number(a.lat.toFixed(7)), longitud: Number(a.lon.toFixed(7)), precision: 10 + Math.random() * 15, simulada: false, bateria: 60 + Math.floor(Math.random() * 40), cargando: false });
  const t = performance.now(); let status = 0;
  try {
    const r = await fetch(API + '/api/visitas/ubicacion', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + a.token, 'x-client-platform': 'mobile', 'x-device-id': 'carga-' + pad(i), 'x-forwarded-for': ipDe(i) }, body: cuerpo, signal: AbortSignal.timeout(20000) });
    await r.arrayBuffer(); status = r.status;
  } catch (e) { status = e?.name === 'TimeoutError' ? 'timeout' : 'red'; }
  marcar(performance.now() - t, status);
}

// Un supervisor: un socket (sin librería: protocolo de Socket.IO a mano sobre el WebSocket de Node) que cuenta los avisos de ubicación y su demora, y el refresco cada 10 s de la lista en vivo.
const sup = { eventos: 0, demoras: [], polls: [], pollsErr: 0, conectados: 0 };
function socketSupervisor(adminToken) {
  const url = API.replace(/^http/, 'ws') + '/socket.io/?EIO=4&transport=websocket';
  const ws = new WebSocket(url);
  ws.onmessage = (m) => {
    const t = String(m.data);
    if (t.startsWith('0')) ws.send('40' + JSON.stringify({ token: adminToken }));
    else if (t === '2') ws.send('3');
    else if (t.startsWith('40')) sup.conectados += 1;
    else if (t.startsWith('42')) {
      try { const [nombre, d] = JSON.parse(t.slice(2)); if (nombre === 'ubicacion_actualizada') { sup.eventos += 1; const f = Date.parse(d?.actualizado_en || d?.fecha || ''); if (Number.isFinite(f)) sup.demoras.push(Date.now() - f); } } catch { /* un aviso mal formado no cuenta */ }
    }
  };
  ws.onerror = () => {};
  return ws;
}
function supervisor(adminToken, s) {
  const ws = socketSupervisor(adminToken);
  (async () => {
    while (corriendo) {
      const t = performance.now();
      try {
        const r = await fetch(API + '/api/usuarios/ubicaciones', { headers: { Authorization: 'Bearer ' + adminToken, 'x-client-platform': 'web', 'x-forwarded-for': `10.200.0.${s + 1}` }, signal: AbortSignal.timeout(20000) });
        const b = await r.arrayBuffer(); if (r.status === 200) sup.polls.push([performance.now() - t, b.byteLength]); else sup.pollsErr += 1;
      } catch { sup.pollsErr += 1; }
      await new Promise((r) => setTimeout(r, 10000 + Math.random() * 500));
    }
  })();
  return ws;
}

// El servidor donde corre esto (la VM): núcleos, carga promedio y memoria libre. Dentro de un contenedor se ven los de la máquina completa.
const memLibreMB = () => { try { const m = readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/); return m ? Math.round(Number(m[1]) / 1024) : NaN; } catch { return NaN; } };

// ---------------------------------------------------------------- ejecución
let socks = []; let fallo = false;
try {
  const adminToken = await preparar();
  console.log(`\nMáquina: ${os.cpus().length} núcleos, ${Math.round(os.totalmem() / 1048576)} MB (${memLibreMB()} MB libres). Servidor probado: ${API}`);
  console.log(`${N} asesores × 1 posición cada ${INT} s = ${(N / INT).toFixed(1)} peticiones/s durante ${SEG} s, con ${SUP} supervisores mirando.\n`);
  const antes = { trk: await sinEmpresa(() => prisma.trackingUbicacion.count({ where: { empresa_id: empresaId } })) };
  for (let s = 0; s < SUP; s += 1) socks.push(supervisor(adminToken, s));
  await new Promise((r) => setTimeout(r, 1500));
  const t0 = Date.now(); const fin = t0 + SEG * 1000;
  // cada asesor arranca en un momento al azar dentro del primer intervalo (no todos a la vez, como en la calle)
  asesores.forEach((a, i) => { (async () => { await new Promise((r) => setTimeout(r, Math.random() * INT * 1000)); while (corriendo && Date.now() < fin) { await ping(a, i); await new Promise((r) => setTimeout(r, INT * 1000 * (0.9 + Math.random() * 0.2))); } })(); });
  console.log('seg |  ok/s | errores |   p50    p95    p99    max (ms) | carga de la máquina (1 min) | memoria libre');
  while (Date.now() < fin && !cortada) {
    await new Promise((r) => setTimeout(r, 10000));
    const dt = (Date.now() - ventana.t0) / 1000; const l = [...ventana.lat].sort((a, b) => a - b);
    const errores = Object.values(ventana.err).reduce((a, b) => a + b, 0); const intentos = ventana.ok + errores;
    console.log(`${String(Math.round((Date.now() - t0) / 1000)).padStart(3)} | ${(ventana.ok / dt).toFixed(1).padStart(5)} | ${String(errores).padStart(7)} | ${pct(l, 50).toFixed(0).padStart(6)} ${pct(l, 95).toFixed(0).padStart(6)} ${pct(l, 99).toFixed(0).padStart(6)} ${(l[l.length - 1] || 0).toFixed(0).padStart(7)}      | ${os.loadavg()[0].toFixed(2).padStart(6)} (${os.cpus().length} núcleos)           | ${memLibreMB()} MB`);
    if (intentos >= 20 && (errores / intentos) * 100 > CORTE) { cortada = true; console.log(`\n¡Se corta! Más del ${CORTE} % de las peticiones falló (${JSON.stringify(ventana.err)}): no se sigue cargando el servidor.`); }
    ventana = nuevaVentana();
  }
  corriendo = false; await new Promise((r) => setTimeout(r, 2500));
  socks.forEach((s) => { try { s.close(); } catch { /* ya cerrado */ } });
  const l = [...total.lat].sort((a, b) => a - b);
  const filas = (await sinEmpresa(() => prisma.trackingUbicacion.count({ where: { empresa_id: empresaId } }))) - antes.trk;
  const eventos = await sinEmpresa(() => prisma.eventoCampo.count({ where: { empresa_id: empresaId } }));
  const errTot = Object.entries(total.err).map(([k, v]) => `${k}:${v}`).join(' ') || 'ninguno';
  const dem = [...sup.demoras].sort((a, b) => a - b); const pl = sup.polls.map((p) => p[0]).sort((a, b) => a - b);
  const intentos = total.ok + Object.values(total.err).reduce((a, b) => a + b, 0);
  console.log(`\n===== RESUMEN (${N} asesores, ${SEG} s) =====`);
  console.log(`Peticiones OK: ${total.ok} de ${intentos} | errores: ${errTot}`);
  console.log(`Latencia de cada posición: p50 ${pct(l, 50).toFixed(0)} ms | p95 ${pct(l, 95).toFixed(0)} ms | p99 ${pct(l, 99).toFixed(0)} ms | máx ${(l[l.length - 1] || 0).toFixed(0)} ms`);
  console.log(`Filas nuevas de recorrido: ${filas} | avisos de llegada/salida: ${eventos}`);
  console.log(`Supervisores (${SUP}): sockets conectados ${sup.conectados}; ${SUP ? (sup.eventos / SEG / SUP).toFixed(1) : 0} avisos/s cada uno${dem.length ? `, demora p50 ${pct(dem, 50)} ms / p95 ${pct(dem, 95)} ms` : ''}; lista en vivo: ${pl.length} respuestas (${sup.pollsErr} fallidas)${pl.length ? `, p50 ${pct(pl, 50).toFixed(0)} ms, p95 ${pct(pl, 95).toFixed(0)} ms, ${Math.round((sup.polls[0]?.[1] || 0) / 1024)} KB cada una` : ''}.`);
  console.log(`Rendimiento: ${(total.ok / SEG).toFixed(1)} posiciones/s sostenidas.`);
  const n429 = total.err[429] || 0;
  if (n429) console.log(`AVISO: ${n429} peticiones recibieron 429 (límite por IP). Si el servidor tiene TRUST_PROXY=true no debería pasar con IPs distintas: revisa esa variable.`);
  const p95 = pct(l, 95); const veredicto = !total.ok ? 'SIN RESPUESTA' : cortada || total.err.timeout || (Object.keys(total.err).length && (intentos - total.ok) / intentos > 0.01) ? 'NO AGUANTA ESTA CARGA' : p95 > 1000 ? 'AGUANTA PERO LENTO (p95 > 1 s)' : p95 > 400 ? 'AGUANTA, CON POCO MARGEN (p95 > 400 ms)' : 'AGUANTA BIEN';
  console.log(`\nVEREDICTO con ${N} asesores: ${veredicto}`);
} catch (x) {
  fallo = true; console.log(`
Falló la prueba: ${String(x?.message || x).slice(0, 300)}`);
} finally {
  corriendo = false;
  socks.forEach((s) => { try { s.close(); } catch { /* ya cerrado */ } });
  if (empresaId && LIMPIAR) { try { await borrarEmpresa(empresaId); console.log('Empresa de prueba borrada.'); } catch (x) { console.log(`No pude borrar la empresa de prueba (${String(x.message).slice(0, 150)}); se borrará sola en la próxima corrida.`); } }
  else if (empresaId) console.log('La empresa de prueba se dejó (--sin-limpiar); se borra en la próxima corrida.');
  await prisma.$disconnect?.();
  process.exit(fallo ? 1 : 0);
}
