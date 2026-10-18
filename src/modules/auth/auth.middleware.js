import jwt from 'jsonwebtoken';
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { normalizeRole, FIELD_ROLES, ROLES } from '#core/security/roles.js';
import { conEmpresa, sinEmpresa } from '#core/tenant/contexto.js';
import { empresaActivaPorId } from '#modules/empresas/empresas.service.js';

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token de autorización requerido', code: 'AUTH_REQUIRED', requestId: req.id });
    const [scheme, token, extra] = header.trim().split(/\s+/);
    if (scheme !== 'Bearer' || !token || extra) {
      return res.status(401).json({ error: 'Formato de autorización inválido', code: 'INVALID_AUTH_FORMAT', requestId: req.id });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'], issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE,
      });
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado', code: 'INVALID_TOKEN', requestId: req.id });
    }

    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Token de acceso inválido', code: 'INVALID_TOKEN', requestId: req.id });
    }
    // Identidad: se busca por id, sin empresa todavía (la empresa sale de esta misma fila, nunca del token ni de la petición).
    const usuario = await sinEmpresa(() => prisma.usuario.findUnique({ where: { id_usuario: decoded.sub } }));
    if (!usuario || usuario.username !== decoded.username) {
      return res.status(401).json({ error: 'Sesión no válida', code: 'INVALID_SESSION', requestId: req.id });
    }
    if (decoded.ver !== usuario.token_version) {
      return res.status(401).json({ error: 'Sesión revocada', code: 'SESSION_REVOKED', requestId: req.id });
    }
    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ error: 'Usuario inactivo', code: 'USER_INACTIVE', requestId: req.id });
    }
    const role = normalizeRole(usuario.rol);
    const requestPlatform = req.get('x-client-platform') === 'mobile' ? 'mobile' : 'web';
    // FIELD_ROLES (solo Auditor de Campo) debe usar siempre la app móvil; todo lo
    // demás (Administrador, Auditor de Oficina) debe usar siempre el backoffice web.
    // Se revalida en cada petición, no solo en el login, por si el token se reutiliza
    // fuera de su canal previsto.
    if (FIELD_ROLES.includes(role) && (decoded.channel !== 'mobile' || requestPlatform !== 'mobile')) {
      return res.status(403).json({ error: 'El acceso de auditores de campo está permitido únicamente desde el aplicativo móvil', code: 'MOBILE_APP_REQUIRED', requestId: req.id });
    }
    if (!FIELD_ROLES.includes(role) && (decoded.channel === 'mobile' || requestPlatform === 'mobile')) {
      return res.status(403).json({ error: 'El acceso de administradores y auditores de oficina está permitido únicamente desde el backoffice web', code: 'WEB_APP_REQUIRED', requestId: req.id });
    }
    // Empresa de la petición: la del usuario. El administrador universal (sin empresa) elige una con x-empresa-id; si no la elige,
    // solo puede usar lo que no es de ninguna empresa (su sesión y el catálogo de empresas).
    let empresaId = usuario.empresa_id || null;
    if (role === ROLES.UNIVERSAL) {
      const pedida = req.get('x-empresa-id');
      empresaId = pedida ? (await empresaActivaPorId(pedida))?.id_empresa || null : null;
      if (pedida && !empresaId) return res.status(404).json({ error: 'La empresa indicada no existe o está suspendida', code: 'EMPRESA_NO_ENCONTRADA', requestId: req.id });
    } else if (!empresaId) {
      return res.status(403).json({ error: 'La cuenta no pertenece a ninguna empresa', code: 'SIN_EMPRESA', requestId: req.id });
    } else if (!(await empresaActivaPorId(empresaId))) {
      return res.status(403).json({ error: 'La empresa de la cuenta está suspendida', code: 'EMPRESA_SUSPENDIDA', requestId: req.id });
    }
    req.user = { id: usuario.id_usuario, username: usuario.username, rol: role, empresa_id: empresaId };
    conEmpresa(empresaId, () => next());
  } catch (error) {
    next(error);
  }
}
