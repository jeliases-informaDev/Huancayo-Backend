import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '#core/config/prisma.js';
import { env, mfaExemptUsernames } from '#core/config/env.js';
import { normalizeRole, ROLES, FIELD_ROLES } from '#core/security/roles.js';
import * as mfaService from './mfa.service.js';

function mapearUsuario(usuario) {
  return {
    id: usuario.id_usuario, username: usuario.username, rol: normalizeRole(usuario.rol),
    nombres: usuario.nombres || null, apellidos: usuario.apellidos || null,
    estado: usuario.estado,
  };
}

function normalizeClientPlatform(value) { return value === 'mobile' ? 'mobile' : 'web'; }
function isFieldRole(role) { return FIELD_ROLES.includes(normalizeRole(role)); }

function accessTokenExpiresIn(role) {
  return isFieldRole(role) ? env.JWT_FIELD_EXPIRES_IN : env.JWT_EXPIRES_IN;
}

function issueAccessToken(usuario, clientPlatform = 'web') {
  const role = normalizeRole(usuario.rol);
  return jwt.sign(
    { username: usuario.username, rol: role, channel: normalizeClientPlatform(clientPlatform), type: 'access', ver: usuario.token_version },
    env.JWT_SECRET,
    {
      expiresIn: accessTokenExpiresIn(role), algorithm: 'HS256', issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE, subject: usuario.id_usuario, jwtid: crypto.randomUUID(),
    }
  );
}

// Vincula la cuenta a un único dispositivo activo por vez (evita sesiones simultáneas
// desde dos teléfonos). El primer inicio de sesión desde el móvil autoriza ese
// dispositivo; para cambiarlo, un administrador debe liberarlo (ver usuarios.service.js).
const DEVICE_DENIED_ERROR = () => Object.assign(
  new Error('Esta cuenta ya está vinculada a otro dispositivo. Pida a un administrador que lo libere.'),
  { statusCode: 409, code: 'DEVICE_NOT_AUTHORIZED' },
);

async function enforceDeviceBinding(usuario, deviceId) {
  if (!deviceId) return;
  const existing = await prisma.dispositivoAutorizado.findFirst({ where: { id_usuario: usuario.id_usuario, activo: true } });
  if (!existing) {
    try {
      await prisma.dispositivoAutorizado.create({
        data: { id_usuario: usuario.id_usuario, device_id: deviceId, primer_uso: new Date(), ultimo_uso: new Date() },
      });
    } catch (error) {
      // Dos logins casi simultáneos (doble tap, reintento de red) pueden pasar ambos
      // el chequeo "no existe" antes de que el primero termine de crear la fila; el
      // índice único (id_usuario, device_id) evita el duplicado pero lanza P2002 en
      // el segundo. Si el dispositivo coincide, no es un ataque: es la misma persona.
      if (error.code === 'P2002') {
        const recheck = await prisma.dispositivoAutorizado.findFirst({ where: { id_usuario: usuario.id_usuario, activo: true } });
        if (recheck?.device_id === deviceId) return;
        throw DEVICE_DENIED_ERROR();
      }
      throw error;
    }
    return;
  }
  if (existing.device_id !== deviceId) {
    throw DEVICE_DENIED_ERROR();
  }
  await prisma.dispositivoAutorizado.update({ where: { id_dispositivo: existing.id_dispositivo }, data: { ultimo_uso: new Date() } });
}

async function login(username, password, clientPlatform, deviceId) {
  try {
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const usuario = await prisma.usuario.findUnique({ where: { username: normalizedUsername } });
    // Comparación dummy para reducir diferencias temporales que faciliten enumeración de usuarios.
    const fallbackHash = '$2b$10$C6UzMDM.H6dfI/f/IKcEe.5Y8R6f0QqM6V7CqY2Y5nJzP9D1r7G7K';
    const validPassword = await bcrypt.compare(password, usuario?.password_hash || fallbackHash);
    if (usuario?.bloqueado_hasta && usuario.bloqueado_hasta > new Date()) {
      return { success: false, code: 'ACCOUNT_LOCKED', error: 'Cuenta temporalmente bloqueada por seguridad' };
    }
    if (!usuario || !validPassword) {
      if (usuario) {
        const attempts = usuario.intentos_fallidos + 1;
        const lock = attempts >= env.MAX_LOGIN_FAILURES ? new Date(Date.now() + env.ACCOUNT_LOCK_MINUTES * 60_000) : null;
        await prisma.usuario.update({ where: { id_usuario: usuario.id_usuario }, data: { intentos_fallidos: lock ? 0 : attempts, bloqueado_hasta: lock } });
      }
      return { success: false, code: 'INVALID_CREDENTIALS', error: 'Credenciales incorrectas' };
    }
    if (usuario.estado !== 'ACTIVO') return { success: false, code: 'USER_INACTIVE', error: 'Cuenta inactiva. Contacte al administrador.' };
    const role = normalizeRole(usuario.rol);
    const platform = normalizeClientPlatform(clientPlatform);
    if (role === ROLES.ADMINISTRADOR && platform === 'mobile') {
      return { success: false, code: 'WEB_ACCESS_DENIED', error: 'Los administradores ingresan exclusivamente desde el backoffice.' };
    }
    // El Supervisor (Auditor de Agencia) opera tanto en la web (mapa en vivo, banco de
    // clientes, evidencias, fichas) como en campo desde la app — solo el Auditor de
    // Campo queda restringido exclusivamente al aplicativo móvil.
    if (role === ROLES.AUDITOR && platform !== 'mobile') {
      return { success: false, code: 'WEB_ACCESS_DENIED', error: 'Los auditores de campo ingresan exclusivamente desde el aplicativo móvil.' };
    }
    if (isFieldRole(role)) {
      try {
        await enforceDeviceBinding(usuario, deviceId);
      } catch (error) {
        return { success: false, code: error.code || 'DEVICE_NOT_AUTHORIZED', error: error.message };
      }
    }
    await prisma.usuario.update({ where: { id_usuario: usuario.id_usuario }, data: { intentos_fallidos: 0, bloqueado_hasta: null, ultimo_acceso: new Date() } });

    const exemptFromGlobalMfa = usuario.mfa_exento || mfaExemptUsernames.includes(usuario.username.trim().toLowerCase());
    if (usuario.mfa_habilitado) {
      return { success: true, mfaRequired: true, challengeToken: mfaService.createChallenge(usuario, platform) };
    }
    if (usuario.mfa_requerido || (!exemptFromGlobalMfa && env.REQUIRE_MFA === 'true')) {
      return { success: true, mfaEnrollmentRequired: true, challengeToken: mfaService.createEnrollmentChallenge(usuario, platform) };
    }
    return { success: true, token: issueAccessToken(usuario, platform), user: mapearUsuario(usuario) };
  } catch {
    return { success: false, code: 'INTERNAL_ERROR', error: 'Error interno del servidor al procesar el inicio de sesión' };
  }
}

async function verifyMfa(challengeToken, code) {
  const { usuario, clientPlatform } = await mfaService.verifyChallenge(challengeToken, code);
  return { success: true, token: issueAccessToken(usuario, clientPlatform), user: mapearUsuario(usuario) };
}

async function setupMfaEnrollment(challengeToken) {
  return mfaService.setupEnrollment(challengeToken);
}

async function confirmMfaEnrollment(challengeToken, code) {
  const { usuario, clientPlatform } = await mfaService.confirmEnrollment(challengeToken, code);
  return { success: true, token: issueAccessToken(usuario, clientPlatform), user: mapearUsuario(usuario) };
}

async function me(idUsuario) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: idUsuario } });
    if (!usuario) return { success: false, code: 'USER_NOT_FOUND', error: 'Usuario no encontrado' };
    if (usuario.estado !== 'ACTIVO') return { success: false, code: 'USER_INACTIVE', error: 'Cuenta inactiva' };
    return { success: true, user: mapearUsuario(usuario) };
  } catch {
    return { success: false, code: 'INTERNAL_ERROR', error: 'Error interno del servidor al obtener la sesión' };
  }
}

async function logout(idUsuario) {
  await prisma.usuario.update({ where: { id_usuario: idUsuario }, data: { token_version: { increment: 1 } } });
}

export default { login, verifyMfa, setupMfaEnrollment, confirmMfaEnrollment, me, logout };
