import { logger } from '#core/config/logger.js';
import crypto from 'node:crypto';
import prisma from '#core/config/prisma.js';
import { sinEmpresa } from '#core/tenant/contexto.js';
import { clasificar, esLecturaAuditada } from '#modules/sistema/seguridad.catalogo.js';
import { registrarSellado, programarSellado } from '#modules/sistema/sello.service.js';

const ESCRIBE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Las consultas de datos personales de clientes y empleados se anotan una sola vez por persona y recurso dentro de una ventana: abrir y recargar la
// misma ficha no llena el registro. La memoria está acotada: borra lo vencido y, si aun así crece,
// lo más viejo. `ahora` se puede inyectar para probarlo.
export function crearDeduplicador({ ventanaMs = 10 * 60 * 1000, maximo = 20_000 } = {}) {
  const hasta = new Map();
  return function repetida(clave, ahora = Date.now()) {
    const vence = hasta.get(clave);
    if (vence && vence > ahora) return true;
    hasta.set(clave, ahora + ventanaMs);
    if (hasta.size > maximo) {
      for (const [k, v] of hasta) if (v <= ahora) hasta.delete(k);
      for (const k of hasta.keys()) { if (hasta.size <= maximo) break; hasta.delete(k); }
    }
    return false;
  };
}
const lecturaRepetida = crearDeduplicador();
// Solo las consultas de pantalla se agrupan: abrir y recargar la misma ficha es una sola consulta. Las descargas y exportaciones son actos distintos y se
// anotan siempre.
const SE_AGRUPAN = new Set(['CONSULTA_EXPEDIENTE', 'CONSULTA_VISITA', 'CONSULTA_RECORRIDO']);

export function auditMiddleware(req, res, next) {
  const metodo = req.method;
  const ruta = req.originalUrl.split('?')[0];
  const escribe = ESCRIBE.has(metodo);
  const lee = metodo === 'GET' && esLecturaAuditada(ruta);
  if (!escribe && !lee) return next();
  const startedAt = Date.now();
  // La posición en vivo del celular llega cada ~10 s por auditor: guardarla también aquí llenaba la tabla de auditoría (millones de filas
  // por día con cientos de auditores) sin aportar nada, porque cada punto ya queda en tracking_ubicacion. Solo se audita si falla.
  // Lo mismo con las rutas por calles que pide la app con cada cambio de posición: solo viajan coordenadas y no cambian nada.
  const esPosicion = (metodo === 'PATCH' && ruta === '/api/visitas/ubicacion') || (metodo === 'POST' && ruta === '/api/rutas/trazar');
  res.on('finish', () => {
    if (esPosicion && res.statusCode < 400) return;
    if (lee) {
      // Una lectura sin sesión no es de nadie (la rechaza el servidor con 401 y es ruido de rastreadores): solo se anota si la sesión era válida o si el
      // servidor la rechazó por permisos (403). Y una sola vez por ventana mientras todo sale bien.
      if (!req.user && res.statusCode !== 403) return;
      if (res.statusCode < 400 && SE_AGRUPAN.has(clasificar({ metodo, ruta }).accion) && lecturaRepetida(`${req.user?.id}|${ruta}`)) return;
    }
    // Quién hizo la petición: la sesión o, en el inicio de sesión y la verificación en dos pasos (donde aún no hay sesión), la cuenta a la que
    // iba dirigida (la deja el controlador de acceso). Sin ella, esos eventos quedaban sin empresa y ningún administrador los veía.
    const actor = req.user
      ? { id: req.user.id, username: req.user.username, rol: req.user.rol, empresa_id: req.user.empresa_id }
      : (req.auditActor || null);
    const clientIp = String(req.ip || '').replace(/^::ffff:/, '').slice(0, 45) || null;
    const loginActor = req.originalUrl.startsWith('/api/auth/login')
      ? String(req.body?.username || '').trim().toLowerCase().slice(0, 50)
      : null;
    const nombreActor = actor?.username || loginActor || 'anonymous';
    const event = {
      event: 'security_audit', requestId: req.id, actorId: actor?.id || null,
      actor: nombreActor, role: actor?.rol || null,
      method: metodo, path: ruta, statusCode: res.statusCode,
      ip: clientIp, userAgent: req.get('user-agent'), durationMs: Date.now() - startedAt,
    };
    logger.info(event, 'auditable_operation');
    const ipHash = crypto.createHash('sha256').update(clientIp || '').digest('hex');
    // req.auditContext: lo llena opcionalmente el controlador cuando la operación
    // cambia una entidad de negocio (ver #core/security/auditContext.js). No todas
    // las escrituras lo usan — solo las instrumentadas explícitamente.
    const diff = req.auditContext || {};
    const clase = clasificar({ metodo, ruta, estado: res.statusCode, anterior: diff.valor_anterior, nuevo: diff.valor_nuevo });
    const idEntidad = diff.entidad_id ? String(diff.entidad_id) : (clase.ref?.id != null ? String(clase.ref.id) : null);
    const datos = {
      empresa_id: actor?.empresa_id || null,
      request_id: req.id, actor_id: actor?.id || null, actor: nombreActor,
      rol: actor?.rol || null, metodo, ruta: ruta.slice(0, 255),
      estado_http: res.statusCode, ip_address: clientIp, ip_hash: ipHash,
      user_agent: (req.get('user-agent') || '').slice(0, 255) || null,
      device_id: (req.get('x-device-id') || '').slice(0, 150) || null,
      accion: clase.accion, categoria: clase.categoria, severidad: clase.severidad,
      plataforma: req.get('x-client-platform') === 'mobile' ? 'MOVIL' : 'WEB',
      // Una consulta que deja detalle (los filtros y el número de filas de una exportación) no es un cambio de datos: no sale en «Solo cambios de datos».
      con_cambios: clase.categoria !== 'CONSULTA' && (diff.valor_anterior !== undefined || diff.valor_nuevo !== undefined),
      entidad: diff.entidad || clase.ref?.tipo || null, entidad_id: idEntidad ? idEntidad.slice(0, 64) : null,
      valor_anterior: diff.valor_anterior ?? undefined, valor_nuevo: diff.valor_nuevo ?? undefined,
    };
    // Cada anotación se guarda sellada (cadena de huellas, ver sistema/sello.service.js). Si el sellado falla (p. ej. el candado tardó más de la
    // cuenta), la anotación se guarda igual sin sello antes que perderla: el sellador periódico la sella después.
    registrarSellado(datos)
      .catch((error) => {
        logger.error({ err: error, requestId: req.id }, 'security_audit_seal_failed');
        programarSellado();
        return sinEmpresa(() => prisma.auditoriaSeguridad.create({ data: datos }));
      })
      .catch(error => logger.error({ err: error, requestId: req.id }, 'security_audit_persistence_failed'));
  });
  next();
}
