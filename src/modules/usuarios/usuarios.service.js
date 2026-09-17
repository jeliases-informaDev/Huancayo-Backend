import prisma from '#core/config/prisma.js';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, FIELD_ROLES, normalizeRole } from '#core/security/roles.js';
import { env, mfaExemptUsernames } from '#core/config/env.js';

function mapUsuario(usuario) {
  const globallyRequired = env.REQUIRE_MFA === 'true'
    && !usuario.mfa_exento
    && !mfaExemptUsernames.includes(usuario.username.trim().toLowerCase());
  return {
    id: usuario.id_usuario, username: usuario.username, rol: normalizeRole(usuario.rol),
    estado: usuario.estado,
    mfa_habilitado: usuario.mfa_habilitado || usuario.mfa_requerido || globallyRequired,
    mfa_confirmado: usuario.mfa_habilitado,
    nombres: usuario.nombres || '', apellidos: usuario.apellidos || '',
    email: usuario.email || '', sede: usuario.sede || '',
  };
}

function assertRole(role) {
  if (!ALL_ROLES.includes(normalizeRole(role))) {
    const error = new Error('El rol indicado no está permitido'); error.statusCode = 400; throw error;
  }
}

async function listar() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { fecha_creacion: 'asc' } });
  return usuarios.map(mapUsuario);
}

async function crear(datos) {
  assertRole(datos.rol);
  const usuario = await prisma.usuario.create({
    data: {
      username: datos.username.trim().toLowerCase(), password_hash: await bcrypt.hash(datos.password, 12),
      nombres: datos.nombres?.trim() || null,
      apellidos: datos.apellidos?.trim() || null,
      email: datos.email?.trim().toLowerCase() || null,
      sede: datos.sede?.trim() || null,
      rol: normalizeRole(datos.rol), estado: datos.estado || 'ACTIVO',
      mfa_requerido: datos.mfa_habilitado === true,
      mfa_exento: datos.mfa_habilitado !== true,
    },
  });
  return mapUsuario(usuario);
}

async function actualizar(id, datos, actorId) {
  if (id === actorId && datos.estado === 'INACTIVO') {
    const error = new Error('No puede desactivar su propia cuenta activa'); error.statusCode = 409; throw error;
  }
  if (datos.rol) assertRole(datos.rol);
  const actual = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  if (!actual) {
    const error = new Error('Usuario no encontrado'); error.statusCode = 404; throw error;
  }
  const data = {
    ...(datos.username ? { username: datos.username.trim().toLowerCase() } : {}),
    ...(datos.nombres !== undefined ? { nombres: datos.nombres.trim() || null } : {}),
    ...(datos.apellidos !== undefined ? { apellidos: datos.apellidos.trim() || null } : {}),
    ...(datos.email !== undefined ? { email: datos.email.trim().toLowerCase() || null } : {}),
    ...(datos.sede !== undefined ? { sede: datos.sede.trim() || null } : {}),
    ...(datos.rol ? { rol: normalizeRole(datos.rol) } : {}),
    ...(datos.estado ? { estado: datos.estado } : {}),
  };
  if (datos.password) {
    data.password_hash = await bcrypt.hash(datos.password, 12);
    data.token_version = { increment: 1 };
    data.password_cambio = new Date();
    data.intentos_fallidos = 0;
    data.bloqueado_hasta = null;
  }
  if (typeof datos.mfa_habilitado === 'boolean') {
    data.mfa_requerido = datos.mfa_habilitado;
    data.mfa_exento = !datos.mfa_habilitado;
    const mfaChanged = actual.mfa_exento !== !datos.mfa_habilitado
      || (datos.mfa_habilitado && !actual.mfa_habilitado && !actual.mfa_requerido)
      || (!datos.mfa_habilitado && (actual.mfa_habilitado || actual.mfa_requerido));
    if (mfaChanged) data.token_version = { increment: 1 };
    if (!datos.mfa_habilitado) {
      data.mfa_habilitado = false;
      data.mfa_secreto = null;
      data.mfa_ultimo_uso = null;
    }
  }
  const usuario = await prisma.usuario.update({ where: { id_usuario: id }, data });
  return mapUsuario(usuario);
}

async function eliminar(id, actorId) {
  if (id === actorId) {
    const error = new Error('No puede eliminar su propia cuenta activa'); error.statusCode = 409; throw error;
  }
  await prisma.usuario.delete({ where: { id_usuario: id } });
}

async function resetMfa(id) {
  await prisma.usuario.update({
    where: { id_usuario: id },
    data: { mfa_requerido: true, mfa_habilitado: false, mfa_secreto: null, mfa_ultimo_uso: null, token_version: { increment: 1 } },
  });
}

// Libera el dispositivo vinculado a la cuenta (p. ej. el auditor cambió de celular).
// El próximo login desde el móvil autoriza el nuevo dispositivo automáticamente.
async function resetDevice(id) {
  await prisma.dispositivoAutorizado.updateMany({ where: { id_usuario: id, activo: true }, data: { activo: false } });
  await prisma.usuario.update({ where: { id_usuario: id }, data: { token_version: { increment: 1 } } });
}

// Última posición conocida de cada supervisor/auditor activo, para el mapa en vivo
// del panel web (Fase 2/Fase 6: "el Auditor de Agencia observa... en tiempo real").
async function ubicacionesActivas() {
  const usuarios = await prisma.usuario.findMany({
    where: { estado: 'ACTIVO', rol: { in: FIELD_ROLES }, latitud: { not: null }, longitud: { not: null } },
    select: { id_usuario: true, username: true, nombres: true, apellidos: true, rol: true, latitud: true, longitud: true },
  });
  return usuarios.map(u => ({
    id: u.id_usuario, username: u.username, nombres: u.nombres || '', apellidos: u.apellidos || '',
    rol: normalizeRole(u.rol),
    latitud: u.latitud != null ? Number(u.latitud) : null,
    longitud: u.longitud != null ? Number(u.longitud) : null,
  }));
}

// Ruta recorrida por un usuario en un día dado (por defecto, hoy) — reconstruye la
// visita a partir de los puntos guardados en tracking_ubicacion.
async function trackingDeUsuario(id, fecha) {
  const inicio = fecha ? new Date(`${fecha}T00:00:00`) : new Date(new Date().toDateString());
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
  const puntos = await prisma.trackingUbicacion.findMany({
    where: { id_usuario: id, registrado_en: { gte: inicio, lt: fin } },
    orderBy: { registrado_en: 'asc' },
    select: { latitud: true, longitud: true, precision_metros: true, registrado_en: true },
  });
  return puntos.map(p => ({
    latitud: Number(p.latitud), longitud: Number(p.longitud),
    precision: p.precision_metros != null ? Number(p.precision_metros) : null,
    fecha: p.registrado_en,
  }));
}

export default { listar, crear, actualizar, eliminar, resetMfa, resetDevice, ubicacionesActivas, trackingDeUsuario };
