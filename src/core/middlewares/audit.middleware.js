import { logger } from '#core/config/logger.js';
import crypto from 'node:crypto';
import prisma from '#core/config/prisma.js';

export function auditMiddleware(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const startedAt = Date.now();
  res.on('finish', () => {
    const clientIp = String(req.ip || '').replace(/^::ffff:/, '').slice(0, 45) || null;
    const loginActor = req.originalUrl.startsWith('/api/auth/login')
      ? String(req.body?.username || '').trim().toLowerCase().slice(0, 50)
      : null;
    const event = {
      event: 'security_audit', requestId: req.id, actorId: req.user?.id || null,
      actor: req.user?.username || loginActor || 'anonymous', role: req.user?.rol || null,
      method: req.method, path: req.originalUrl.split('?')[0], statusCode: res.statusCode,
      ip: clientIp, userAgent: req.get('user-agent'), durationMs: Date.now() - startedAt,
    };
    logger.info(event, 'auditable_operation');
    const ipHash = crypto.createHash('sha256').update(clientIp || '').digest('hex');
    // req.auditContext: lo llena opcionalmente el controlador cuando la operación
    // cambia una entidad de negocio (ver #core/security/auditContext.js). No todas
    // las escrituras lo usan — solo las instrumentadas explícitamente.
    const diff = req.auditContext || {};
    prisma.auditoriaSeguridad.create({ data: {
      request_id: req.id, actor_id: req.user?.id || null, actor: req.user?.username || loginActor || 'anonymous',
      rol: req.user?.rol || null, metodo: req.method, ruta: req.originalUrl.split('?')[0].slice(0, 255),
      estado_http: res.statusCode, ip_address: clientIp, ip_hash: ipHash,
      user_agent: (req.get('user-agent') || '').slice(0, 255) || null,
      entidad: diff.entidad || null, entidad_id: diff.entidad_id ? String(diff.entidad_id) : null,
      valor_anterior: diff.valor_anterior ?? undefined, valor_nuevo: diff.valor_nuevo ?? undefined,
    } }).catch(error => logger.error({ err: error, requestId: req.id }, 'security_audit_persistence_failed'));
  });
  next();
} 