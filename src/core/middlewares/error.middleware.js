import { ZodError } from 'zod';
import { logger } from '#core/config/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Recurso no encontrado', code: 'NOT_FOUND', requestId: req.id });
}

export function errorHandler(error, req, res, _next) {
  const uploadError = error?.name === 'MulterError';
  // Restricción de unicidad de Prisma (ej. username o codigo_expediente repetido) sin
  // manejo especifico rio arriba: se traduce a un 409 legible en vez de un 500 generico.
  const duplicateKeyError = error?.code === 'P2002';
  const status = Number(error.statusCode) || (error instanceof ZodError || uploadError ? 400 : duplicateKeyError ? 409 : 500);
  const operational = status < 500;
  logger[operational ? 'warn' : 'error']({ err: error, requestId: req.id, method: req.method, path: req.originalUrl }, 'request_failed');

  const payload = {
    error: operational ? (error.message || 'Solicitud inválida') : 'Error interno del servidor',
    code: error.code || (operational ? 'REQUEST_ERROR' : 'INTERNAL_ERROR'),
    requestId: req.id,
  };
  if (error instanceof ZodError) {
    payload.error = 'Los datos enviados no son válidos';
    payload.details = error.issues.map(({ path, message }) => ({ field: path.join('.'), message }));
  }
  if (uploadError) {
    payload.error = error.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera el límite de 100 MB' : 'Carga de archivo inválida';
    payload.code = error.code;
  }
  if (duplicateKeyError) {
    const campo = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : error.meta?.target;
    payload.error = campo ? `Ya existe un registro con ese valor en: ${campo}` : 'Ya existe un registro con ese valor único';
    payload.code = 'DUPLICATE_KEY';
  }
  res.status(status).json(payload);
}