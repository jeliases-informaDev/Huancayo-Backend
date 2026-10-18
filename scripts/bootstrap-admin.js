import bcrypt from 'bcryptjs';
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { sinEmpresa } from '#core/tenant/contexto.js';
import { slugDe } from '#modules/empresas/empresas.service.js';

// Arranque: garantiza que exista la primera empresa, su administrador y, si se pide por variables, el administrador universal de Sulotec.
// El nombre de acceso y el rol son conceptos distintos: el usuario inicial se persiste en minúsculas (el inicio de sesión no distingue
// mayúsculas) y sus permisos pertenecen al rol ADMINISTRADOR de su empresa. Corre fuera de toda petición: ámbito de plataforma.
const username = (process.env.INITIAL_ADMIN_USERNAME || 'CajaHuancayo').trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD || '';
const resetRequested = process.env.RESET_INITIAL_ADMIN === 'true';

function validateCredentials(nombre, clave, etiqueta) {
  if (!/^[a-z0-9._-]{3,50}$/.test(nombre)) {
    throw new Error(`${etiqueta}_USERNAME debe tener entre 3 y 50 caracteres validos`);
  }
  if (clave.length < 12 || !/[a-z]/.test(clave) || !/[A-Z]/.test(clave) || !/\d/.test(clave) || !/[^A-Za-z0-9]/.test(clave)) {
    throw new Error(`${etiqueta}_PASSWORD debe tener al menos 12 caracteres, mayuscula, minuscula, numero y simbolo`);
  }
}

async function primeraEmpresa() {
  const existente = await prisma.empresa.findFirst({ where: { estado: 'ACTIVA' }, orderBy: { creado_en: 'asc' } });
  if (existente) return existente;
  const creada = await prisma.empresa.create({ data: { nombre: env.EMPRESA_INICIAL_NOMBRE, nombre_corto: env.EMPRESA_INICIAL_NOMBRE, slug: slugDe(env.EMPRESA_INICIAL_NOMBRE) } });
  process.stdout.write(`Empresa inicial creada: ${creada.nombre}.\n`);
  return creada;
}

async function administradorDeEmpresa(empresa) {
  const existingAdmin = await prisma.usuario.findFirst({
    where: { empresa_id: empresa.id_empresa, rol: { in: ['ADMINISTRADOR', 'ADMIN'] } },
    select: { id_usuario: true, username: true, ultimo_acceso: true },
  });
  const firstProductionAccess = Boolean(existingAdmin && password && !existingAdmin.ultimo_acceso);
  if (existingAdmin && (resetRequested || firstProductionAccess)) {
    validateCredentials(username, password, 'INITIAL_ADMIN');
    const usernameOwner = await prisma.usuario.findUnique({ where: { username }, select: { id_usuario: true } });
    if (usernameOwner && usernameOwner.id_usuario !== existingAdmin.id_usuario) {
      throw new Error(`INITIAL_ADMIN_USERNAME ya pertenece a otro usuario: ${username}`);
    }
    await prisma.usuario.update({
      where: { id_usuario: existingAdmin.id_usuario },
      data: {
        username, password_hash: await bcrypt.hash(password, 12), rol: 'ADMINISTRADOR', estado: 'ACTIVO',
        intentos_fallidos: 0, bloqueado_hasta: null, token_version: { increment: 1 },
        mfa_requerido: false, mfa_habilitado: false, mfa_secreto: null, mfa_ultimo_uso: null, password_cambio: new Date(),
      },
    });
    process.stdout.write(resetRequested
      ? `Administrador ${username} restablecido. Desactive RESET_INITIAL_ADMIN inmediatamente.\n`
      : `Credenciales iniciales aplicadas al administrador ${username}.\n`);
  } else if (existingAdmin) {
    process.stdout.write(`Administrador existente: ${existingAdmin.username}. Bootstrap omitido.\n`);
  } else {
    validateCredentials(username, password, 'INITIAL_ADMIN');
    await prisma.usuario.create({ data: { empresa_id: empresa.id_empresa, username, password_hash: await bcrypt.hash(password, 12), rol: 'ADMINISTRADOR', estado: 'ACTIVO' } });
    process.stdout.write(`Administrador inicial creado: ${username} (${empresa.nombre}).\n`);
  }
}

// Administrador universal de Sulotec: no pertenece a ninguna empresa y entra a cada una desde el panel. Solo si se piden las variables.
async function administradorUniversal() {
  const nombre = (env.INITIAL_UNIVERSAL_USERNAME || '').trim().toLowerCase();
  const clave = env.INITIAL_UNIVERSAL_PASSWORD || '';
  if (!nombre) return;
  const existente = await prisma.usuario.findFirst({ where: { rol: 'UNIVERSAL' }, select: { username: true } });
  if (existente) { process.stdout.write(`Administrador universal existente: ${existente.username}.\n`); return; }
  validateCredentials(nombre, clave, 'INITIAL_UNIVERSAL');
  if (await prisma.usuario.findUnique({ where: { username: nombre }, select: { id_usuario: true } })) throw new Error(`INITIAL_UNIVERSAL_USERNAME ya pertenece a otro usuario: ${nombre}`);
  await prisma.usuario.create({ data: { empresa_id: null, username: nombre, password_hash: await bcrypt.hash(clave, 12), rol: 'UNIVERSAL', estado: 'ACTIVO', mfa_requerido: true, mfa_exento: false } });
  process.stdout.write(`Administrador universal creado: ${nombre} (debera configurar su segundo factor al entrar).\n`);
}

try {
  await sinEmpresa(async () => {
    const empresa = await primeraEmpresa();
    await administradorDeEmpresa(empresa);
    await administradorUniversal();
  });
} finally {
  await prisma.$disconnect();
}
