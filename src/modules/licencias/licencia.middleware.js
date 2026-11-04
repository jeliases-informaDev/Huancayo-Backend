// Guardia de licencia: corre al final de la autenticación (ya con req.user y la empresa fijada), antes de cada ruta. Solo mira las escrituras no
// exentas; qué se bloquea y con qué texto lo decide licencias.core.js con el estado que respondió Sulotec (o el último conocido). Con las
// licencias apagadas (LICENCIAS_TOKEN vacío) pasa de inmediato, y ante un error propio también: nunca tumba una petición por su cuenta.
import { logger } from '#core/config/logger.js';
import { decidir, esExenta, ENLACES } from './licencias.core.js';
import { configuracion, licenciaDe } from './licencias.service.js';

export async function licenciaMiddleware(req, res, next) {
  let decision = { permitir: true };
  let estado = null;
  try {
    if (configuracion().activo) {
      const datos = {
        metodo: req.method, baseUrl: req.baseUrl, ruta: String(req.originalUrl || req.url || '').split('?')[0],
        body: req.body, rol: req.user?.rol, empresaId: req.user?.empresa_id,
      };
      if (!esExenta(datos)) {
        const licencia = await licenciaDe(datos.empresaId);
        estado = licencia?.estado ?? null;
        decision = decidir({ ...datos, estado });
      }
    }
  } catch (error) {
    logger.error({ err: error, requestId: req.id }, 'licencias_middleware_fallo');
    decision = { permitir: true };
  }
  if (decision.permitir) return next();
  // Queda anotado en la petición para que el registro de seguridad distinga un bloqueo de licencia de un 403 de permisos.
  req.licenciaBloqueo = { code: decision.code, estado };
  res.status(403).json({ error: decision.mensaje, code: decision.code, estado, enlace: ENLACES.miLicencia, requestId: req.id });
}
