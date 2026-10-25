import prisma from '#core/config/prisma.js';
import { Prisma } from '../../generated/prisma/index.js';
import { logger } from '#core/config/logger.js';
import { sinEmpresa } from '#core/tenant/contexto.js';
import { GENESIS, calcularSello, verificarCadena } from './sello.core.js';

// Sello de integridad del registro de auditoría: cómo se escribe cada anotación sellada, cómo se sellan las que quedaron sin sello y cómo se
// verifica la cadena. La cadena es una sola para toda la plataforma (todas las empresas), así que las escrituras se serializan con un candado
// de fila: la transacción que anota bloquea la fila única de `auditoria_sello_cabeza` (SELECT … FOR UPDATE) y el bloqueo se suelta recién al
// confirmar, por lo que la siguiente transacción ya ve la anotación anterior confirmada. (Un GET_LOCK no sirve: se soltaría antes del COMMIT y dos
// anotaciones podrían recibir el mismo número.) Vale aunque corran varias instancias de la API.
const LOTE_SELLADO = 200;
const LOTE_VERIFICACION = 2000;
const CABEZA_ID = 1;

// Garantiza que exista la fila del candado (la crea la migración; esto es por si alguien la borró).
export async function asegurarCabeza() {
  await prisma.auditoriaSelloCabeza.upsert({ where: { id: CABEZA_ID }, update: {}, create: { id: CABEZA_ID, secuencia: 0, sello: GENESIS } });
}

// Bloquea la fila del candado hasta el final de la transacción y devuelve la cabeza REAL de la cadena (leída de la tabla del registro, no del espejo).
async function bloquearYLeerCabeza(tx) {
  const filas = await tx.$queryRaw`SELECT secuencia, sello FROM auditoria_sello_cabeza WHERE id = ${CABEZA_ID} FOR UPDATE`;
  if (!filas.length) throw Object.assign(new Error('Falta la fila del candado del sello de auditoría (auditoria_sello_cabeza)'), { code: 'SELLO_SIN_CABEZA' });
  const real = await tx.auditoriaSeguridad.findFirst({ where: { secuencia: { not: null } }, orderBy: { secuencia: 'desc' }, select: { secuencia: true, sello: true, fecha: true } });
  return real || { secuencia: 0, sello: GENESIS, fecha: null };
}
const reflejarCabeza = (tx, secuencia, sello) => tx.auditoriaSelloCabeza.update({ where: { id: CABEZA_ID }, data: { secuencia, sello, actualizado: new Date() } });

// Crea una anotación y la sella en la misma transacción. La huella se calcula sobre la fila tal como la devuelve la base (en MySQL `create` relee
// la fila insertada): así la verificación, que también lee de la base, recalcula exactamente lo mismo.
export function registrarSellado(data) {
  return sinEmpresa(() => prisma.$transaction(async (tx) => {
    const cabeza = await bloquearYLeerCabeza(tx);
    const fila = await tx.auditoriaSeguridad.create({ data: { ...data, secuencia: cabeza.secuencia + 1, sello_previo: cabeza.sello } });
    const sello = calcularSello(fila);
    await tx.auditoriaSeguridad.update({ where: { id_auditoria: fila.id_auditoria }, data: { sello } });
    await reflejarCabeza(tx, fila.secuencia, sello);
    return { ...fila, sello };
    // maxWait: en una ráfaga, cada transacción espera su conexión del pool y luego el candado de fila; con los valores por defecto (2 s) se caían
    // al sellado diferido sin necesidad.
  }, { maxWait: 15000, timeout: 30000 }));
}

// Sella las anotaciones sin sello (las anteriores a la migración, o alguna que se guardó sin sellar por una falla momentánea), de la más antigua
// a la más nueva. Cada lote es una transacción corta con el candado tomado y UNA sola sentencia UPDATE para todo el lote: así las anotaciones
// nuevas (que también necesitan el candado) se intercalan entre lote y lote en vez de esperar. Idempotente: se puede correr las veces que haga falta.
// Mientras se sella lo viejo, lo nuevo recibe números intercalados: la cadena sigue siendo una sola, ordenada por número y no por fecha.
export async function sellarPendientes({ lote = LOTE_SELLADO, maximo = Infinity } = {}) {
  let selladas = 0;
  for (;;) {
    const n = await sinEmpresa(() => prisma.$transaction(async (tx) => {
      const cabeza = await bloquearYLeerCabeza(tx);
      const pendientes = await tx.auditoriaSeguridad.findMany({ where: { secuencia: null }, orderBy: [{ fecha: 'asc' }, { id_auditoria: 'asc' }], take: lote });
      if (!pendientes.length) return 0;
      let secuencia = cabeza.secuencia; let previo = cabeza.sello;
      const valores = pendientes.map((fila) => {
        secuencia += 1;
        const sello = calcularSello({ ...fila, secuencia, sello_previo: previo });
        const v = { id: fila.id_auditoria, secuencia, sello_previo: previo, sello };
        previo = sello;
        return v;
      });
      const ids = Prisma.join(valores.map((v) => v.id));
      const caso = (campo) => Prisma.join(valores.map((v) => Prisma.sql`WHEN ${v.id} THEN ${v[campo]}`), ' ');
      await tx.$executeRaw`UPDATE auditoria_seguridad SET
        secuencia = CASE id_auditoria ${caso('secuencia')} END,
        sello_previo = CASE id_auditoria ${caso('sello_previo')} END,
        sello = CASE id_auditoria ${caso('sello')} END
        WHERE id_auditoria IN (${ids}) AND secuencia IS NULL`;
      await reflejarCabeza(tx, secuencia, previo);
      return pendientes.length;
    }, { timeout: 30000 }));
    selladas += n;
    if (n < lote || selladas >= maximo) break;
  }
  if (selladas) logger.info({ selladas }, 'auditoria_sello_pendientes_selladas');
  return selladas;
}

// Recorre las últimas `ultimas` anotaciones selladas y recalcula la cadena. Devuelve si está intacta y, si no, dónde y por qué se rompió.
export async function verificar({ ultimas = 10000 } = {}) {
  return sinEmpresa(async () => {
    const cabeza = await prisma.auditoriaSeguridad.findFirst({ where: { secuencia: { not: null } }, orderBy: { secuencia: 'desc' }, select: { secuencia: true, sello: true, fecha: true } });
    const sinSellar = await prisma.auditoriaSeguridad.count({ where: { secuencia: null } });
    const ahora = new Date();
    if (!cabeza) return { ok: true, revisadas: 0, desde: null, hasta: null, sello_actual: null, fecha_cabeza: null, sin_sellar: sinSellar, verificado_en: ahora };
    const comun = { hasta: cabeza.secuencia, sello_actual: cabeza.sello, fecha_cabeza: cabeza.fecha, sin_sellar: sinSellar, verificado_en: ahora };
    const desde = Math.max(1, cabeza.secuencia - ultimas + 1);
    let estado = { sello: GENESIS, secuencia: null };
    if (desde > 1) {
      const anterior = await prisma.auditoriaSeguridad.findUnique({ where: { secuencia: desde - 1 }, select: { sello: true } });
      if (!anterior) return { ok: false, revisadas: 0, desde, rotura: { secuencia: desde - 1, motivo: 'SALTO', detalle: `falta la anotación n.° ${desde - 1}` }, ...comun };
      estado = { sello: anterior.sello, secuencia: desde - 1 };
    }
    let revisadas = 0; let rotura = null;
    for (let inicio = desde; inicio <= cabeza.secuencia && !rotura; inicio += LOTE_VERIFICACION) {
      const filas = await prisma.auditoriaSeguridad.findMany({ where: { secuencia: { gte: inicio, lte: Math.min(inicio + LOTE_VERIFICACION - 1, cabeza.secuencia) } }, orderBy: { secuencia: 'asc' } });
      const r = verificarCadena(filas, estado);
      if (!r.ok) { rotura = { secuencia: r.secuencia, motivo: r.motivo, detalle: r.detalle }; revisadas += Math.max(0, filas.findIndex((f) => f.secuencia === r.secuencia)); break; }
      estado = { sello: r.sello, secuencia: r.secuencia }; revisadas += filas.length;
    }
    const esperadas = cabeza.secuencia - desde + 1;
    if (!rotura && revisadas !== esperadas) rotura = { secuencia: null, motivo: 'SALTO', detalle: `se esperaban ${esperadas} anotaciones en el tramo y hay ${revisadas}` };
    // El espejo de la cabeza debe coincidir con la cadena: si no, alguien tocó las últimas anotaciones o el espejo.
    const espejo = await prisma.auditoriaSelloCabeza.findUnique({ where: { id: CABEZA_ID } });
    if (!rotura && espejo && (espejo.secuencia !== cabeza.secuencia || espejo.sello !== cabeza.sello)) {
      rotura = { secuencia: cabeza.secuencia, motivo: 'CABEZA', detalle: `la cabeza registrada es la n.° ${espejo.secuencia} y la cadena termina en la n.° ${cabeza.secuencia}: faltan o cambiaron anotaciones al final` };
    }
    return { ok: !rotura, revisadas, desde, ...(rotura ? { rotura } : {}), ...comun };
  });
}

// Cada tanto se sellan las anotaciones que hayan quedado sin sello (al arrancar y luego cada 15 minutos). Nunca tumba el servidor.
const correrSellado = () => asegurarCabeza().then(() => sellarPendientes()).catch((error) => logger.error({ err: error }, 'auditoria_sello_pendientes_fallo'));
export function iniciarSelladoPendiente({ cadaMs = 15 * 60 * 1000 } = {}) {
  setTimeout(correrSellado, 5000).unref();
  setInterval(correrSellado, cadaMs).unref();
}

// Cuando una anotación se guardó sin sello (la transacción falló), se programa un sellado en unos segundos en vez de esperar al periódico; varias
// seguidas se juntan en una sola corrida.
let sellarProgramado = null;
export function programarSellado({ enMs = 3000 } = {}) {
  if (sellarProgramado) return;
  sellarProgramado = setTimeout(() => { sellarProgramado = null; correrSellado(); }, enMs);
  sellarProgramado.unref();
}

export default { registrarSellado, sellarPendientes, verificar, iniciarSelladoPendiente, programarSellado, asegurarCabeza };
