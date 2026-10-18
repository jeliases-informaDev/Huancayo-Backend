// Inicio de sesión con la cuenta Sulotec (Keycloak en cuenta.sulotec.com, OpenID Connect con PKCE). El panel manda el código de
// autorización; aquí se canjea, se verifica el id_token con las llaves públicas del emisor y se busca al usuario LOCAL por su correo:
// la cuenta Sulotec identifica a la persona, pero el rol y la empresa salen siempre de la base de Auditoría, nunca del token.
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import prisma from '#core/config/prisma.js';
import { env, allowedOrigins } from '#core/config/env.js';
import { sinEmpresa } from '#core/tenant/contexto.js';
import { normalizeRole, FIELD_ROLES, ROLES } from '#core/security/roles.js';

// Rol de Keycloak del grupo "Administradores Generales" de Sulotec.
const ROL_SULOTEC_TOTAL = 'administrador-general';
const LLAVES_TTL_MS = 10 * 60_000;
let llaves = { en: 0, porKid: new Map() };

const fallo = (mensaje, code, statusCode = 401) => Object.assign(new Error(mensaje), { statusCode, code });

// Activo solo cuando el servidor tiene emisor y cliente configurados (SSO_ISSUER, SSO_CLIENT_ID).
export function configuracion(e = env) {
  const issuer = String(e.SSO_ISSUER || '').trim().replace(/\/$/, '');
  const clientId = String(e.SSO_CLIENT_ID || '').trim();
  if (!/^https?:\/\//.test(issuer) || !clientId) return { activo: false };
  return { activo: true, issuer, clientId };
}

// El panel solo puede volver a una dirección propia (las de FRONTEND_URL) terminada en /sso.
export function redirectUriPermitida(redirectUri, origenes = allowedOrigins) {
  return typeof redirectUri === 'string' && origenes.some((o) => redirectUri === `${o}/sso`);
}

async function llavePublica(kid, issuer) {
  if (!llaves.porKid.has(kid) || Date.now() - llaves.en > LLAVES_TTL_MS) {
    const r = await fetch(`${issuer}/protocol/openid-connect/certs`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw fallo('No se pudo consultar las llaves de la cuenta Sulotec', 'SSO_EMISOR', 502);
    const { keys = [] } = await r.json();
    llaves = { en: Date.now(), porKid: new Map(keys.filter((k) => k.use !== 'enc' && k.kid).map((k) => [k.kid, crypto.createPublicKey({ key: k, format: 'jwk' })])) };
  }
  const llave = llaves.porKid.get(kid);
  if (!llave) throw fallo('El token de Sulotec está firmado con una llave desconocida', 'SSO_TOKEN');
  return llave;
}

async function canjearCodigo({ code, codeVerifier, redirectUri }, cfg) {
  const r = await fetch(`${cfg.issuer}/protocol/openid-connect/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(8000),
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: cfg.clientId, code, redirect_uri: redirectUri, code_verifier: codeVerifier }),
  });
  if (!r.ok) throw fallo('Sulotec no aceptó el inicio de sesión (el enlace venció o ya se usó). Vuelve a intentarlo.', 'SSO_CODIGO');
  const { id_token: idToken } = await r.json();
  if (!idToken) throw fallo('Sulotec no devolvió la identidad', 'SSO_TOKEN');
  return idToken;
}

// Verifica firma (RS256 con la llave pública del emisor), emisor y audiencia del id_token. Exportada para las pruebas.
export async function verificarIdToken(idToken, cfg, obtenerLlave = llavePublica) {
  const { header } = jwt.decode(idToken, { complete: true }) || {};
  if (!header?.kid) throw fallo('Token de Sulotec inválido', 'SSO_TOKEN');
  const llave = await obtenerLlave(header.kid, cfg.issuer);
  try {
    return jwt.verify(idToken, llave, { algorithms: ['RS256'], issuer: cfg.issuer, audience: cfg.clientId });
  } catch {
    throw fallo('Token de Sulotec inválido o vencido', 'SSO_TOKEN');
  }
}

// Con los datos verificados de la cuenta Sulotec, elige el usuario local (por correo). Exportada para las pruebas.
export function elegirUsuarioLocal(claims, candidatos) {
  const correo = String(claims.email || '').trim().toLowerCase();
  if (!correo) throw fallo('Tu cuenta Sulotec no tiene correo', 'SSO_SIN_CORREO', 403);
  if (claims.email_verified === false) throw fallo('Confirma tu correo en cuenta.sulotec.com antes de entrar', 'SSO_CORREO_NO_VERIFICADO', 403);
  if (candidatos.length === 0) throw fallo('Tu cuenta Sulotec no está vinculada a ningún usuario de Auditoría de Visitas. Pide a tu administrador que registre tu correo en tu usuario.', 'SSO_NO_VINCULADO', 403);
  if (candidatos.length > 1) throw fallo('Tu correo está en más de un usuario de Auditoría de Visitas: pide a Sulotec que lo corrija.', 'SSO_AMBIGUO', 409);
  const usuario = candidatos[0];
  const rol = normalizeRole(usuario.rol);
  if (FIELD_ROLES.includes(rol)) throw fallo('Los auditores de campo ingresan exclusivamente desde el aplicativo móvil.', 'WEB_ACCESS_DENIED', 403);
  // El rol más poderoso exige doble llave: usuario UNIVERSAL local y cuenta Sulotec de administrador general.
  const rolesSulotec = Array.isArray(claims.roles) ? claims.roles : [];
  if (rol === ROLES.UNIVERSAL && !rolesSulotec.includes(ROL_SULOTEC_TOTAL)) throw fallo('Tu cuenta Sulotec no es de administrador general', 'SSO_SIN_PERMISO', 403);
  return usuario;
}

// Flujo completo: código → id_token verificado → usuario local activo con ese correo.
export async function usuarioDesdeSulotec(datos) {
  const cfg = configuracion();
  if (!cfg.activo) throw fallo('El inicio de sesión con Sulotec no está habilitado en este servidor', 'SSO_INACTIVO', 404);
  if (!redirectUriPermitida(datos.redirectUri)) throw fallo('Dirección de retorno no permitida', 'SSO_REDIRECT', 400);
  const idToken = await canjearCodigo(datos, cfg);
  const claims = await verificarIdToken(idToken, cfg);
  const correo = String(claims.email || '').trim().toLowerCase();
  const candidatos = correo ? await sinEmpresa(() => prisma.usuario.findMany({ where: { email: correo, estado: 'ACTIVO' }, take: 2 })) : [];
  const usuario = elegirUsuarioLocal(claims, candidatos);
  await sinEmpresa(() => prisma.usuario.update({ where: { id_usuario: usuario.id_usuario }, data: { intentos_fallidos: 0, bloqueado_hasta: null, ultimo_acceso: new Date() } }));
  return usuario;
}
