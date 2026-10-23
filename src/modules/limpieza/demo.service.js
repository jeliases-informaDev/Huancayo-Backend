import prisma from '#core/config/prisma.js';
import { logger } from '#core/config/logger.js';
import storage from '#modules/sistema/storage.service.js';
import { invalidarPuntos } from '#modules/auditorias/eventos-campo.js';
import { snapshotExpediente } from '#modules/auditorias/visitas.service.js';
import { empresaActual } from '#core/tenant/contexto.js';
import { exigirModoPruebas } from './limpieza.service.js';
import { esSinPermiso } from './limpieza.core.js';
import { CASOS, PREFIJO_CODIGO, PREFIJO_SINCRONIZACION, datosDeExpediente, datosDeVisita } from './demo.core.js';
import { fotoDemo } from './demo.fotos.js';

// Datos de demostración (dentro del modo pruebas): cargan 24 visitas ficticias para ver las pantallas con información y las quitan después sin tocar nada
// real. Solo el administrador, siempre dentro de su empresa, y solo con el modo pruebas encendido (viene apagado: así no se mezclan con datos reales por
// descuido). Lo que se crea lleva una marca (código DEMO-LIM-… y client_sync_id demo-…): quitar solo borra eso.

const falla = (statusCode, code, mensaje) => Object.assign(new Error(mensaje), { statusCode, code });
// 1×1 transparente: sirve de firma de ejemplo en las fichas donde el asesor sí llegó al cliente.
const FIRMA_DEMO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const PRIORIDADES = ['ALTA', 'MEDIA', 'BAJA'];

const dondeVisitasDemo = () => ({ client_sync_id: { startsWith: PREFIJO_SINCRONIZACION }, expediente: { codigo_expediente: { startsWith: PREFIJO_CODIGO } } });
const dondeExpedientesDemo = () => ({ codigo_expediente: { startsWith: PREFIJO_CODIGO } });

// Cuántos datos de demostración hay ahora y con cuántos asesores se podrían cargar. No exige el modo pruebas: solo cuenta.
export async function estadoDemo() {
  const [visitas, expedientes, auditores] = await Promise.all([
    prisma.visitaAuditoria.count({ where: dondeVisitasDemo() }),
    prisma.expediente.count({ where: dondeExpedientesDemo() }),
    prisma.usuario.count({ where: { rol: 'AUDITOR', estado: 'ACTIVO' } }),
  ]);
  return { visitas, expedientes, auditores, previstas: CASOS.length };
}

async function guardarFoto({ auditor, expediente, tipo, indice }) {
  const bytes = fotoDemo(indice, `${String(empresaActual()).slice(0, 8)}-${expediente.codigo_expediente}-${tipo}`);
  const subida = storage.createUpload({ auditorId: auditor.id_usuario, expedienteId: expediente.id_expediente, tipo, contentType: 'image/jpeg', size: bytes.length });
  return storage.receiveUpload({ key: subida.key, buffer: bytes, auditorId: auditor.id_usuario, expedienteId: expediente.id_expediente, tipo });
}

// Crea las 24 visitas. Si alguna ya existe (se cargó antes) la salta: se puede volver a llamar sin duplicar nada. Las hacen los asesores activos de la empresa, repartidas.
export async function cargarVisitasDemo({ actorId }) {
  await exigirModoPruebas();
  const auditores = await prisma.usuario.findMany({ where: { rol: 'AUDITOR', estado: 'ACTIVO' }, orderBy: { username: 'asc' }, take: 20, select: { id_usuario: true, username: true, nombres: true, apellidos: true } });
  if (!auditores.length) throw falla(409, 'SIN_AUDITORES', 'Crea al menos un asesor (en Usuarios) para que las visitas de ejemplo tengan quién las hizo.');
  const existentes = new Set((await prisma.expediente.findMany({ where: dondeExpedientesDemo(), select: { codigo_expediente: true } })).map((e) => e.codigo_expediente));
  const ahoraMs = Date.now();
  const empresa = empresaActual();
  const total = { creadas: 0, omitidas: 0, fotos: 0 };

  for (const [indice, caso] of CASOS.entries()) {
    const datos = datosDeExpediente(caso);
    if (existentes.has(datos.codigo_expediente)) { total.omitidas += 1; continue; }
    const auditor = auditores[caso.auditor % auditores.length];
    const visita = datosDeVisita(caso, ahoraMs, datos, empresa);
    const expediente = await prisma.expediente.create({ data: { ...datos, estado: 'VISITADO', fecha_creacion: new Date(visita.fecha_hora_checkin.getTime() - 3 * 24 * 60 * 60 * 1000) } });
    try {
      const asignacion = await prisma.asignacionAuditoria.create({
        data: {
          id_expediente: expediente.id_expediente, id_usuario_auditor: auditor.id_usuario, estado: 'FINALIZADA', prioridad: PRIORIDADES[caso.n % PRIORIDADES.length], origen: 'SUPERVISOR', asignado_por: actorId,
          fecha_asignacion: new Date(visita.fecha_hora_checkin.getTime() - 24 * 60 * 60 * 1000), fecha_fin: visita.fecha_hora_checkout,
        },
      });
      const fotos = [];
      for (let i = 0; i < caso.fotos; i += 1) {
        const tipo = i === 0 ? 'FOTO_PRINCIPAL' : 'FOTO_ADICIONAL';
        fotos.push({ tipo, ...(await guardarFoto({ auditor, expediente, tipo, indice: indice * 2 + i })) });
      }
      await prisma.$transaction(async (tx) => {
        const creada = await tx.visitaAuditoria.create({
          data: {
            ...visita, id_asignacion: asignacion.id_asignacion, id_expediente: expediente.id_expediente, id_usuario_auditor: auditor.id_usuario,
            expediente_snapshot: snapshotExpediente(expediente), firma_evidencia: ['CONFORME', 'OBSERVADO'].includes(caso.resultado) ? FIRMA_DEMO : null,
          },
        });
        for (const f of fotos) {
          await tx.evidencia.create({ data: { id_visita: creada.id_visita, tipo: f.tipo, object_key: f.key, hash_sha256: f.hash, latitud_captura: visita.latitud, longitud_captura: visita.longitud, capturado_en: visita.fecha_hora_checkin } });
        }
      });
      total.creadas += 1; total.fotos += fotos.length;
    } catch (error) {
      // Que no quede un expediente de ejemplo a medias: se quita lo de este caso y se avisa.
      await prisma.asignacionAuditoria.deleteMany({ where: { id_expediente: expediente.id_expediente } }).catch(() => {});
      await prisma.expediente.delete({ where: { id_expediente: expediente.id_expediente } }).catch(() => {});
      logger.error({ err: error, codigo: datos.codigo_expediente }, 'carga_visitas_demo_fallo');
      throw falla(502, 'DEMO_NO_SE_PUDO_CARGAR', 'No se pudieron guardar las visitas de ejemplo (por ejemplo, las fotos en el almacenamiento). Intenta de nuevo en un momento.');
    }
  }
  invalidarPuntos();
  return { ...total, previstas: CASOS.length, asesores: auditores.length };
}

// Quita SOLO lo marcado como demostración: visitas con sus fotos (archivo y fila), asignaciones y expedientes de ejemplo. Lo real no se toca.
export async function quitarVisitasDemo() {
  await exigirModoPruebas();
  const borrado = { visitas: 0, fotos: 0, asignaciones: 0, expedientes: 0, archivos_sin_borrar: 0 };
  const visitas = await prisma.visitaAuditoria.findMany({ where: dondeVisitasDemo(), select: { id_visita: true } });
  const ids = visitas.map((v) => v.id_visita);
  if (ids.length) {
    const fotos = await prisma.evidencia.findMany({ where: { id_visita: { in: ids } }, select: { id_evidencia: true, object_key: true } });
    for (const f of fotos) {
      try { await storage.borrarEvidencia(f.object_key); } catch (error) {
        if (!esSinPermiso(error)) throw falla(502, 'ALMACEN_NO_RESPONDE', 'No se pudieron borrar las fotos de ejemplo del almacenamiento. Intenta de nuevo en un momento.');
        borrado.archivos_sin_borrar += 1; // la cuenta del almacén no puede borrar: queda el archivo, se borra la fila
      }
    }
    if (fotos.length) borrado.fotos = (await prisma.evidencia.deleteMany({ where: { id_evidencia: { in: fotos.map((f) => f.id_evidencia) } } })).count;
    borrado.visitas = (await prisma.visitaAuditoria.deleteMany({ where: { id_visita: { in: ids } } })).count;
  }
  const expedientes = await prisma.expediente.findMany({ where: dondeExpedientesDemo(), select: { id_expediente: true } });
  const idsExpediente = expedientes.map((e) => e.id_expediente);
  if (idsExpediente.length) {
    await prisma.eventoCampo.deleteMany({ where: { id_expediente: { in: idsExpediente } } });
    await prisma.expedienteCambio.deleteMany({ where: { id_expediente: { in: idsExpediente } } });
    borrado.asignaciones = (await prisma.asignacionAuditoria.deleteMany({ where: { id_expediente: { in: idsExpediente } } })).count;
    borrado.expedientes = (await prisma.expediente.deleteMany({ where: { id_expediente: { in: idsExpediente } } })).count;
  }
  invalidarPuntos();
  return borrado;
}
