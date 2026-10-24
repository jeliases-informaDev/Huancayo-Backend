// Diagnóstico EN VIVO con datos reales de la base (solo lectura: únicamente SELECT y SHOW; no escribe nada ni toca ningún dato).
// Responde: cuántos asesores y supervisores hay, cuántos están trabajando AHORA, cuántas posiciones por minuto llegan de verdad, cuál fue el pico real de los últimos 7 días,
// cómo crece lo que se guarda y cómo está la conexión a la base. Cada consulta tiene un tope de 20 s por si la tabla fuera enorme.
//
// Dentro del servidor, sin copiar nada al contenedor (el script entra por la entrada estándar):
//   docker exec -i auditoria-api node --input-type=module - < diagnostico-en-vivo.js
// o con la imagen (si ya trae este archivo):  docker exec auditoria-api node scripts/diagnostico-en-vivo.js
// En una PC con la base local:  APP_RAIZ=C:/CajaHuancayo-Backend node scripts/diagnostico-en-vivo.js
import os from 'node:os';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const raiz = (process.env.APP_RAIZ || '/app').replace(/\/$/, '');
const prisma = (await import(pathToFileURL(`${raiz}/src/core/config/prisma.js`).href)).default;

const n = (v) => Number(v ?? 0);
const miles = (v) => n(v).toLocaleString('es-PE');
const lima = (d) => (d ? new Date(d).toLocaleString('es-PE', { timeZone: 'America/Lima', hour12: false }) : '—');
// «2026-10-23 14:05» (hora de la base, UTC) → hora de Lima
const limaTexto = (m) => { const d = new Date(`${m.replace(' ', 'T')}:00Z`); return Number.isNaN(d.getTime()) ? m : lima(d).replace(/:\d\d$/, ''); };
const hace = (min) => new Date(Date.now() - min * 60_000);
async function q(titulo, fn) { try { return await fn(); } catch (e) { console.log(`   (${titulo}: no se pudo leer — ${String(e.message).split('\n').pop().slice(0, 110)})`); return null; } }
const uno = async (consulta) => (await consulta)[0];

console.log(`\n===== CAJA HUANCAYO EN VIVO — datos reales de la base, ${lima(new Date())} (hora de Lima) =====`);

// ---------------------------------------------------------------- máquina
let memLibre = '?'; try { const m = readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/); if (m) memLibre = `${Math.round(Number(m[1]) / 1024)} MB`; } catch { /* no es Linux */ }
console.log(`\n-- Máquina: ${os.cpus().length} núcleos; carga promedio ${os.loadavg().map((x) => x.toFixed(2)).join(' / ')} (1, 5 y 15 min); memoria libre ${memLibre} de ${Math.round(os.totalmem() / 1048576)} MB`);

// ---------------------------------------------------------------- personas
console.log('\n-- Cuentas');
const personas = await q('cuentas', () => prisma.$queryRaw`SELECT /*+ MAX_EXECUTION_TIME(20000) */ COALESCE(e.nombre, '(universal)') AS empresa, u.rol, u.estado, COUNT(*) AS c FROM usuarios u LEFT JOIN empresas e ON e.id_empresa = u.empresa_id GROUP BY e.nombre, u.rol, u.estado ORDER BY e.nombre, u.rol`);
for (const f of personas || []) console.log(`   ${String(f.empresa).padEnd(28)} ${String(f.rol).padEnd(14)} ${String(f.estado).padEnd(9)} ${miles(f.c)}`);

// ---------------------------------------------------------------- ahora
console.log('\n-- Ahora mismo (lo que de verdad está pasando)');
const enJornada = await q('jornadas', () => uno(prisma.$queryRaw`SELECT COUNT(*) AS c FROM usuarios WHERE rol = 'AUDITOR' AND estado = 'ACTIVO' AND jornada_inicio IS NOT NULL AND (jornada_fin IS NULL OR jornada_fin < jornada_inicio)`));
if (enJornada) console.log(`   Asesores con la jornada iniciada: ${miles(enJornada.c)}`);
for (const [etiqueta, min] of [['en el último minuto', 1], ['en los últimos 2 minutos', 2], ['en los últimos 10 minutos', 10], ['en la última hora', 60]]) {
  const r = await q('posiciones recientes', () => uno(prisma.$queryRaw`SELECT COUNT(*) AS c FROM usuarios WHERE rol = 'AUDITOR' AND ubicacion_en >= ${hace(min)}`));
  if (r) console.log(`   Asesores que mandaron su posición ${etiqueta}: ${miles(r.c)}`);
}
for (const min of [1, 5, 15]) {
  const r = await q('posiciones', () => uno(prisma.$queryRaw`SELECT /*+ MAX_EXECUTION_TIME(20000) */ COUNT(*) AS c FROM tracking_ubicacion WHERE registrado_en >= ${hace(min)}`));
  if (r) console.log(`   Posiciones guardadas en los últimos ${min} min: ${miles(r.c)} (${(n(r.c) / min).toFixed(1)} por minuto, ${(n(r.c) / min / 60).toFixed(2)} por segundo)`);
}
const hoyLima = new Date(); hoyLima.setUTCHours(5, 0, 0, 0); if (hoyLima > new Date()) hoyLima.setUTCDate(hoyLima.getUTCDate() - 1);
const visitas = await q('visitas', () => uno(prisma.$queryRaw`SELECT COUNT(*) AS c FROM visitas_auditoria WHERE fecha_hora_checkin >= ${hoyLima}`));
if (visitas) console.log(`   Visitas registradas hoy: ${miles(visitas.c)}`);

// ---------------------------------------------------------------- picos reales
console.log('\n-- Picos reales de los últimos 7 días (la medida que importa: asesores trabajando a la vez)');
const desde7 = hace(7 * 24 * 60);
const picoPos = await q('pico de posiciones', () => prisma.$queryRaw`SELECT /*+ MAX_EXECUTION_TIME(20000) */ DATE_FORMAT(registrado_en, '%Y-%m-%d %H:%i') AS m, COUNT(*) AS c, COUNT(DISTINCT id_usuario) AS u FROM tracking_ubicacion WHERE registrado_en >= ${desde7} GROUP BY m ORDER BY c DESC LIMIT 3`);
for (const f of picoPos || []) console.log(`   Minuto con más posiciones: ${limaTexto(f.m)} → ${miles(f.c)} posiciones de ${miles(f.u)} asesores (${(n(f.c) / 60).toFixed(2)} por segundo)`);
if (picoPos && !picoPos.length) console.log('   Todavía no hay posiciones guardadas en los últimos 7 días.');
const picoAses = await q('pico de asesores', () => prisma.$queryRaw`SELECT /*+ MAX_EXECUTION_TIME(20000) */ DATE_FORMAT(registrado_en, '%Y-%m-%d %H:%i') AS m, COUNT(DISTINCT id_usuario) AS u FROM tracking_ubicacion WHERE registrado_en >= ${desde7} GROUP BY m ORDER BY u DESC LIMIT 1`);
for (const f of picoAses || []) console.log(`   Más asesores distintos en un mismo minuto: ${miles(f.u)} (${limaTexto(f.m)})`);
const porDia = await q('posiciones por día', () => prisma.$queryRaw`SELECT /*+ MAX_EXECUTION_TIME(20000) */ DATE_FORMAT(DATE_SUB(registrado_en, INTERVAL 5 HOUR), '%Y-%m-%d') AS d, COUNT(*) AS c, COUNT(DISTINCT id_usuario) AS u FROM tracking_ubicacion WHERE registrado_en >= ${desde7} GROUP BY d ORDER BY d`);
for (const f of porDia || []) console.log(`   ${f.d}: ${miles(f.c)} posiciones de ${miles(f.u)} asesores`);

// ---------------------------------------------------------------- lo que crece
console.log('\n-- Lo que se va guardando (crecimiento real)');
const trk = await q('recorrido', () => uno(prisma.$queryRaw`SELECT COUNT(*) AS c, MIN(registrado_en) AS desde FROM tracking_ubicacion`));
if (trk) console.log(`   Recorrido (tracking_ubicacion): ${miles(trk.c)} filas, la más antigua del ${lima(trk.desde)} (se depura a los 90 días)`);
const aud = await q('registro de seguridad', () => uno(prisma.$queryRaw`SELECT COUNT(*) AS c, MIN(fecha) AS desde FROM auditoria_seguridad`));
if (aud) console.log(`   Registro de seguridad (auditoria_seguridad): ${miles(aud.c)} filas desde el ${lima(aud.desde)} (no se depura nunca)`);
const audDia = await q('registro por día', () => prisma.$queryRaw`SELECT /*+ MAX_EXECUTION_TIME(20000) */ DATE_FORMAT(DATE_SUB(fecha, INTERVAL 5 HOUR), '%Y-%m-%d') AS d, COUNT(*) AS c FROM auditoria_seguridad WHERE fecha >= ${desde7} GROUP BY d ORDER BY d`);
if (audDia?.length) console.log(`   Registro de seguridad por día: ${audDia.map((f) => `${f.d.slice(5)}: ${miles(f.c)}`).join(' · ')}`);
const tablas = await q('tablas', () => prisma.$queryRawUnsafe(`SELECT table_name AS t, table_rows AS filas, ROUND((data_length + index_length) / 1048576) AS mb FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY (data_length + index_length) DESC LIMIT 6`));
if (tablas?.length) console.log(`   Tablas más grandes: ${tablas.map((f) => `${f.t} ${miles(f.mb)} MB (~${miles(f.filas)} filas)`).join(' · ')}`);
const exp = await q('expedientes', () => uno(prisma.$queryRaw`SELECT COUNT(*) AS c, SUM(estado = 'PENDIENTE') AS p, SUM(estado = 'ASIGNADO') AS a FROM expedientes`));
if (exp) console.log(`   Expedientes: ${miles(exp.c)} (${miles(exp.p)} sin asignar, ${miles(exp.a)} asignados)`);

// ---------------------------------------------------------------- base de datos
console.log('\n-- Conexión a la base (compartida con los otros productos de la máquina)');
const estado = await q('estado de MySQL', () => prisma.$queryRawUnsafe(`SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected', 'Threads_running', 'Max_used_connections', 'Uptime', 'Slow_queries', 'Aborted_connects')`));
const vars = await q('variables de MySQL', () => prisma.$queryRawUnsafe(`SHOW VARIABLES WHERE Variable_name IN ('max_connections')`));
if (estado) {
  const m = Object.fromEntries(estado.map((f) => [f.Variable_name, n(f.Value)]));
  console.log(`   Conexiones abiertas ahora: ${miles(m.Threads_connected)} de ${miles(vars?.[0]?.Value)} permitidas (máximo alcanzado desde que arrancó: ${miles(m.Max_used_connections)}); consultas ejecutándose: ${miles(m.Threads_running)}`);
  console.log(`   MySQL lleva encendido ${(m.Uptime / 86400).toFixed(1)} días; consultas lentas: ${miles(m.Slow_queries)}; conexiones rechazadas: ${miles(m.Aborted_connects)}`);
}
console.log('\nFin. Solo se leyó: no se cambió ningún dato.\n');
await prisma.$disconnect?.();
process.exit(0);
