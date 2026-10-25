import { once } from 'node:events';
import service from './seguridad.service.js';
import { verificar as verificarSello } from './sello.service.js';
import { logger } from '#core/config/logger.js';

async function auditoria(req, res, next) {
  try { res.json(await service.listar(req.validated.query)); } catch (error) { next(error); }
}

async function metricas(req, res, next) {
  try { res.json({ data: await service.metricas(req.validated.query) }); } catch (error) { next(error); }
}

async function integridad(req, res, next) {
  try { res.json({ data: await verificarSello({ ultimas: req.validated.query.ultimas }) }); } catch (error) { next(error); }
}

async function alertas(req, res, next) {
  try { res.json(await service.alertas(req.validated.query)); } catch (error) { next(error); }
}

// Descarga del registro filtrado en CSV. Se escribe por lotes y se respeta el ritmo del cliente (si la conexión va lenta, se espera a que se vacíe el
// búfer en vez de acumular filas en memoria). La exportación también queda anotada en el registro (quién, con qué filtros y cuántas filas).
async function exportar(req, res, next) {
  const q = req.validated.query;
  let cortado = false;
  res.on('close', () => { if (!res.writableFinished) cortado = true; });
  try {
    const dia = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="registro-de-seguridad-${dia}.csv"`);
    const escribir = async (texto) => { if (!res.write(texto)) await once(res, 'drain'); };
    const { filas } = await service.exportarCsv(q, { escribir, cancelado: () => cortado });
    req.auditContext = { entidad: 'AuditoriaSeguridad', entidad_id: null, valor_anterior: null, valor_nuevo: { filtros: q, filas, completo: !cortado } };
    res.end();
  } catch (error) {
    if (!res.headersSent) { res.removeHeader('Content-Disposition'); return next(error); }
    // Ya se empezó a enviar el archivo: no se puede cambiar la respuesta; se corta la descarga y queda el motivo en el log del servidor.
    logger.error({ err: error, requestId: req.id }, 'exportacion_registro_seguridad_fallo');
    res.destroy(error);
  }
}

export default { auditoria, metricas, alertas, exportar, integridad };
