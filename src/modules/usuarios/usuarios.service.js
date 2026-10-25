import prisma from '#core/config/prisma.js';
import { VERSION_TERMINOS } from '#modules/terminos/terminos.reglas.js';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, FIELD_ROLES, ROLES, normalizeRole } from '#core/security/roles.js';
import { empresaActual, sinEmpresa } from '#core/tenant/contexto.js';
import { env, mfaExemptUsernames } from '#core/config/env.js';
import asignacionesService from '#modules/auditorias/asignaciones.service.js';
import { codificarCursorJornada, decodificarCursorJornada, duracionMin, textoZona } from '#modules/auditorias/jornada.core.js';
import { publica as empresaPublica, usuarioConPrefijo } from '#modules/empresas/empresas.service.js';
import { infoPaginas } from '#modules/auditorias/asignaciones.paginacion.js';
import { paginaDeUsuarios, filtroUsuarios, filtroAuditores, juntarZonas, ESTADO_ELIMINADO } from './usuarios.filtros.js';

// Dentro de una empresa el nombre de usuario lleva su abreviatura fija (arq.jorge); el universal de Sulotec no tiene empresa ni prefijo.
async function usernameDeEmpresa(empresaId, username) {
  const prefijo = empresaId ? (await empresaPublica(empresaId))?.prefijo || null : null;
  const completo = usuarioConPrefijo(prefijo, username);
  if (completo.length > 50) throw Object.assign(new Error('El nombre de usuario, con la abreviatura de la empresa, supera los 50 caracteres'), { statusCode: 400, code: 'USERNAME_LARGO' });
  return completo;
}

// Zona de trabajo: la de su última jornada (null si nunca inició una o su app no mandó posición). `texto` queda null si la posición no trajo nombres.
const zonaDeUsuario = (u) => (u.zona_en ? {
  texto: textoZona({ distrito: u.zona_distrito, provincia: u.zona_provincia, departamento: u.zona_departamento }) || null,
  distrito: u.zona_distrito || null, provincia: u.zona_provincia || null, departamento: u.zona_departamento || null, en: u.zona_en,
} : null);

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
    email: usuario.email || '', sede: usuario.sede || '', departamento: usuario.departamento || '', zona: zonaDeUsuario(usuario),
    ultimo_acceso: usuario.ultimo_acceso || null, // el panel lo muestra en Usuarios («Nunca» si aún no entró)
  };
}

// Snapshot para el registro de auditoría: nunca incluye password_hash ni mfa_secreto.
function auditSnapshot(usuario) {
  return {
    username: usuario.username, nombres: usuario.nombres, apellidos: usuario.apellidos,
    email: usuario.email, sede: usuario.sede, departamento: usuario.departamento,
    rol: normalizeRole(usuario.rol), estado: usuario.estado,
    mfa_requerido: usuario.mfa_requerido, mfa_exento: usuario.mfa_exento,
  };
}

function assertRole(role) {
  if (!ALL_ROLES.includes(normalizeRole(role))) {
    const error = new Error('El rol indicado no está permitido'); error.statusCode = 400; throw error;
  }
}

// Usuarios de la empresa por páginas (pantalla Usuarios): la búsqueda, el rol y el estado se resuelven en la base y la respuesta dice cuántos hay en total.
// Del más antiguo al más nuevo, con el id como desempate para que dos páginas nunca repitan ni pierdan a nadie.
async function listar(consulta = {}) {
  const pag = paginaDeUsuarios(consulta);
  const where = filtroUsuarios(consulta);
  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      where, orderBy: [{ fecha_creacion: 'asc' }, { id_usuario: 'asc' }], skip: (pag.page - 1) * pag.limit, take: pag.limit,
      // Si ya aceptó la versión vigente de los términos (desde la app o el panel), para que el administrador lo vea.
      include: { aceptacionesTerminos: { where: { version: VERSION_TERMINOS }, select: { version: true, fecha: true, plataforma: true }, take: 1 } },
    }),
    prisma.usuario.count({ where }),
  ]);
  return { data: usuarios.map((u) => ({ ...mapUsuario(u), terminos: u.aceptacionesTerminos?.[0] || null })), pagination: infoPaginas(pag, total) };
}

const auditorSelect = { id_usuario: true, username: true, nombres: true, apellidos: true, rol: true, departamento: true, zona_distrito: true, zona_provincia: true, zona_departamento: true, zona_en: true };
const aAuditor = (u) => ({ id: u.id_usuario, username: u.username, nombres: u.nombres || '', apellidos: u.apellidos || '', rol: normalizeRole(u.rol), departamento: u.departamento || null, zona: zonaDeUsuario(u) });

// Lista acotada para que el Auditor de Oficina arme asignaciones y filtre visitas,
// sin exponerle el resto de la gestion de cuentas (exclusiva del Administrador).
// Sin page ni limit devuelve todos (los selectores de otras pantallas); con ellos, la columna «Auditores» de Asignaciones: por páginas, con búsqueda,
// zona y los casos activos de cada auditor (un conteo de la base solo para los de la página).
async function listarAuditores(consulta = {}) {
  const porPaginas = consulta.page !== undefined || consulta.limit !== undefined;
  if (!porPaginas && !consulta.q && !consulta.zona && !consulta.id) {
    const usuarios = await prisma.usuario.findMany({ where: filtroAuditores(), orderBy: [{ nombres: 'asc' }, { id_usuario: 'asc' }], select: auditorSelect });
    return { data: usuarios.map(aAuditor) };
  }
  const pag = paginaDeUsuarios(consulta);
  const where = filtroAuditores(consulta);
  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({ where, orderBy: [{ nombres: 'asc' }, { apellidos: 'asc' }, { id_usuario: 'asc' }], skip: (pag.page - 1) * pag.limit, take: pag.limit, select: auditorSelect }),
    prisma.usuario.count({ where }),
  ]);
  const activas = usuarios.length ? await prisma.asignacionAuditoria.groupBy({ by: ['id_usuario_auditor'], where: { id_usuario_auditor: { in: usuarios.map((u) => u.id_usuario) }, estado: 'ACTIVA' }, _count: { _all: true } }) : [];
  const activos = new Map(activas.map((f) => [f.id_usuario_auditor, f._count._all]));
  return { data: usuarios.map((u) => ({ ...aAuditor(u), activos: activos.get(u.id_usuario) || 0 })), pagination: infoPaginas(pag, total) };
}

// Zonas que tienen los auditores activos (departamento de su última jornada, o su zona habitual si nunca iniciaron una), para el filtro «Zona».
async function zonasDeAuditores() {
  const base = { rol: { in: [...FIELD_ROLES] }, estado: 'ACTIVO' };
  const [conJornada, sinJornada] = await Promise.all([
    prisma.usuario.groupBy({ by: ['zona_departamento'], where: { ...base, zona_en: { not: null }, zona_departamento: { not: null } }, _count: { _all: true } }),
    prisma.usuario.groupBy({ by: ['departamento'], where: { ...base, zona_en: null, departamento: { not: null } }, _count: { _all: true } }),
  ]);
  return juntarZonas(conJornada.map((f) => [f.zona_departamento, f._count._all]), sinJornada.map((f) => [f.departamento, f._count._all]));
}

async function crear(datos) {
  assertRole(datos.rol);
  // El administrador universal de Sulotec no pertenece a ninguna empresa: se crea fuera del contexto y con empresa nula.
  const universal = normalizeRole(datos.rol) === ROLES.UNIVERSAL;
  const crearFila = (data) => (universal ? sinEmpresa(() => prisma.usuario.create({ data: { ...data, empresa_id: null } })) : prisma.usuario.create({ data }));
  const username = await usernameDeEmpresa(universal ? null : empresaActual(), datos.username);
  // Una cuenta eliminada no se borra: su nombre de usuario queda reservado para que el historial siga apuntando a una sola persona.
  const reservado = await sinEmpresa(() => prisma.usuario.findFirst({ where: { username, estado: ESTADO_ELIMINADO }, select: { id_usuario: true } }));
  if (reservado) throw Object.assign(new Error('Ese nombre de usuario perteneció a una cuenta eliminada y queda reservado para conservar su historial. Elige otro.'), { statusCode: 409, code: 'USERNAME_RESERVADO' });
  const usuario = await crearFila({
      username, password_hash: await bcrypt.hash(datos.password, 12),
      nombres: datos.nombres?.trim() || null,
      apellidos: datos.apellidos?.trim() || null,
      email: datos.email?.trim().toLowerCase() || null,
      sede: datos.sede?.trim() || null,
      departamento: datos.departamento?.trim() || null,
      rol: normalizeRole(datos.rol), estado: datos.estado || 'ACTIVO',
      mfa_requerido: datos.mfa_habilitado === true,
      mfa_exento: datos.mfa_habilitado !== true,
  });
  return { ...mapUsuario(usuario), _auditDiff: { entidad: 'Usuario', entidad_id: usuario.id_usuario, valor_anterior: null, valor_nuevo: auditSnapshot(usuario) } };
}

async function actualizar(id, datos, actorId) {
  if (id === actorId && datos.estado === 'INACTIVO') {
    const error = new Error('No puede desactivar su propia cuenta activa'); error.statusCode = 409; throw error;
  }
  if (datos.rol) assertRole(datos.rol);
  const actual = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  // Una cuenta eliminada ya no existe para el panel: no se edita ni se vuelve a activar.
  if (!actual || actual.estado === ESTADO_ELIMINADO) {
    const error = new Error('Usuario no encontrado'); error.statusCode = 404; throw error;
  }
  const data = {
    ...(datos.username ? { username: await usernameDeEmpresa(actual.empresa_id, datos.username) } : {}),
    ...(datos.nombres !== undefined ? { nombres: datos.nombres.trim() || null } : {}),
    ...(datos.apellidos !== undefined ? { apellidos: datos.apellidos.trim() || null } : {}),
    ...(datos.email !== undefined ? { email: datos.email.trim().toLowerCase() || null } : {}),
    ...(datos.sede !== undefined ? { sede: datos.sede.trim() || null } : {}),
    ...(datos.departamento !== undefined ? { departamento: datos.departamento.trim() || null } : {}),
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
  // Si se desactiva a un auditor de campo, sus clientes en curso no deben quedar
  // "asignados" a alguien que ya no puede iniciar sesión ni visitarlos: se liberan
  // para que el Auditor de Oficina los reasigne a otra persona.
  if (datos.estado === 'INACTIVO' && actual.estado !== 'INACTIVO') {
    await asignacionesService.cancelarTodasDeAuditor(id, actorId);
  }
  return {
    ...mapUsuario(usuario),
    // clave_cambiada: queda anotado que se cambió la contraseña (nunca la contraseña) para que el registro de seguridad lo distinga de una edición común.
    _auditDiff: { entidad: 'Usuario', entidad_id: id, valor_anterior: auditSnapshot(actual), valor_nuevo: { ...auditSnapshot(usuario), ...(datos.password ? { clave_cambiada: true } : {}) } },
  };
}

// «Eliminar» NO borra nada de la base: la cuenta pasa a ELIMINADO, deja de verse en el panel, no puede entrar y su sesión y su celular se cierran. Sus visitas,
// fotos y registros de auditoría se conservan. A diferencia de desactivar (que se ve en la lista y se puede activar), una eliminada ya no sale ni se reactiva.
async function eliminar(id, actorId) {
  if (id === actorId) {
    const error = new Error('No puede eliminar su propia cuenta activa'); error.statusCode = 409; throw error;
  }
  const actual = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  if (!actual || actual.estado === ESTADO_ELIMINADO) {
    const error = new Error('Usuario no encontrado'); error.statusCode = 404; throw error;
  }
  const usuario = await prisma.usuario.update({ where: { id_usuario: id }, data: { estado: ESTADO_ELIMINADO, token_version: { increment: 1 } } });
  await prisma.dispositivoAutorizado.updateMany({ where: { id_usuario: id, activo: true }, data: { activo: false } });
  await asignacionesService.cancelarTodasDeAuditor(id, actorId); // sus casos en curso vuelven a «Disponibles»
  return { _auditDiff: { entidad: 'Usuario', entidad_id: id, valor_anterior: auditSnapshot(actual), valor_nuevo: auditSnapshot(usuario) } };
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
    // Solo quienes dieron señal o iniciaron jornada en los últimos 7 días: la lista en vivo no puede crecer con cada auditor que alguna vez usó la app
    // (el listado completo de auditores se pide aparte con /api/usuarios/auditores).
    where: { estado: 'ACTIVO', rol: { in: FIELD_ROLES }, OR: [{ ubicacion_en: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, { jornada_inicio: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }] },
    select: { id_usuario: true, username: true, nombres: true, apellidos: true, rol: true, latitud: true, longitud: true, ubicacion_en: true, ubicacion_precision: true, ubicacion_simulada: true, mov_estado: true, mov_desde: true, mov_velocidad: true, mov_modo: true, bateria_porcentaje: true, bateria_cargando: true, jornada_inicio: true, jornada_fin: true },
  });
  return usuarios.map(u => ({
    id: u.id_usuario, username: u.username, nombres: u.nombres || '', apellidos: u.apellidos || '',
    // Calculado al recibir cada posición (ver visitas.service); aquí solo se lee.
    movimiento: { estado: u.mov_estado || 'SIN_DATOS', desde: u.mov_desde ? u.mov_desde.toISOString() : null, velocidad_kmh: u.mov_velocidad != null ? Number(u.mov_velocidad) : null, modo: u.mov_modo || null },
    rol: normalizeRole(u.rol),
    latitud: u.latitud != null ? Number(u.latitud) : null,
    longitud: u.longitud != null ? Number(u.longitud) : null,
    // Cuándo llegó la posición (null = posiciones anteriores a que se guardara la hora) para que el panel distinga "en vivo" de "sin señal".
    actualizado_en: u.ubicacion_en ? u.ubicacion_en.toISOString() : null,
    precision: u.ubicacion_precision != null ? Number(u.ubicacion_precision) : null,
    simulada: Boolean(u.ubicacion_simulada),
    // Estado del celular en esa posición (null = la app no lo informó).
    bateria: u.bateria_porcentaje ?? null,
    cargando: Boolean(u.bateria_cargando),
    // Jornada: el supervisor distingue «terminó su jornada» de «perdió la señal en plena jornada».
    en_jornada: Boolean(u.jornada_inicio) && (!u.jornada_fin || u.jornada_fin < u.jornada_inicio),
    jornada_inicio: u.jornada_inicio ? u.jornada_inicio.toISOString() : null,
    jornada_fin: u.jornada_fin ? u.jornada_fin.toISOString() : null,
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
    select: { latitud: true, longitud: true, precision_metros: true, simulada: true, registrado_en: true },
  });
  return puntos.map(p => ({
    latitud: Number(p.latitud), longitud: Number(p.longitud),
    precision: p.precision_metros != null ? Number(p.precision_metros) : null,
    simulada: p.simulada,
    fecha: p.registrado_en,
  }));
}

// Historial de jornadas de un usuario, de la más reciente a la más antigua, por páginas con cursor (nunca se carga todo el historial). Cada fila trae cuándo
// empezó y terminó, cuánto duró y la zona desde la que salió; `total` es el número real de jornadas.
async function jornadasDe(id, { limit = 30, cursor } = {}) {
  const usuario = await prisma.usuario.findFirst({ where: { id_usuario: id }, select: { id_usuario: true, username: true, nombres: true, apellidos: true, rol: true } });
  if (!usuario) { const error = new Error('Usuario no encontrado'); error.statusCode = 404; throw error; }
  const desde = cursor ? decodificarCursorJornada(cursor) : null;
  if (cursor && !desde) { const error = new Error('La posición de la lista no es válida: vuelve a cargarla.'); error.statusCode = 400; error.code = 'CURSOR_INVALIDO'; throw error; }
  const where = { id_usuario: id, ...(desde ? { OR: [{ inicio: { lt: desde.inicio } }, { inicio: desde.inicio, id_jornada: { lt: desde.id } }] } : {}) };
  const [filas, total] = await Promise.all([
    prisma.jornadaCampo.findMany({ where, orderBy: [{ inicio: 'desc' }, { id_jornada: 'desc' }], take: limit + 1 }),
    prisma.jornadaCampo.count({ where: { id_usuario: id } }),
  ]);
  const hayMas = filas.length > limit;
  const pagina = hayMas ? filas.slice(0, limit) : filas;
  const ultima = pagina[pagina.length - 1];
  return {
    usuario: { id: usuario.id_usuario, username: usuario.username, nombre: `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || usuario.username, rol: normalizeRole(usuario.rol) },
    data: pagina.map((f) => ({
      id: f.id_jornada, inicio: f.inicio, fin: f.fin, cierre: f.cierre, en_curso: !f.fin && !f.cierre, duracion_min: duracionMin(f),
      zona: textoZona(f) || null, departamento: f.departamento, provincia: f.provincia, distrito: f.distrito,
      latitud: f.latitud == null ? null : Number(f.latitud), longitud: f.longitud == null ? null : Number(f.longitud),
      precision_metros: f.precision_metros == null ? null : Number(f.precision_metros), simulada: f.simulada,
    })),
    siguiente: hayMas && ultima ? codificarCursorJornada(ultima.inicio, ultima.id_jornada) : null,
    total,
  };
}

export default { listar, listarAuditores, zonasDeAuditores, crear, actualizar, eliminar, resetMfa, resetDevice, ubicacionesActivas, trackingDeUsuario, jornadasDe };
