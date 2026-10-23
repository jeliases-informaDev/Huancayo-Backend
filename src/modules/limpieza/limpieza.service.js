import bcrypt from 'bcryptjs';
import prisma from '#core/config/prisma.js';
import { env } from '#core/config/env.js';
import { logger } from '#core/config/logger.js';
import { sinEmpresa } from '#core/tenant/contexto.js';
import storage from '#modules/sistema/storage.service.js';
import { modoPruebasActivo, fijarModoPruebas } from '#modules/sistema/configuracion.service.js';
import { invalidarPuntos } from '#modules/auditorias/eventos-campo.js';
import { ceros, confirmaLimpieza, confirmaUsuario, crearPresupuesto, esSinPermiso, estadoDespuesDeBorrar, motivoQueImpideBorrar } from './limpieza.core.js';

// Modo pruebas: borrar un empleado con todo lo suyo y limpiar los datos cargados para volver a probar desde cero. Es lo único del sistema que
// borra visitas y fotos, por eso:
//  · viene APAGADO: cada empresa lo enciende (y queda en la auditoría) y el panel avisa mientras esté encendido;
//  · solo el administrador, siempre dentro de su empresa (el filtro de Prisma agrega la empresa a cada consulta);
//  · pide confirmar escribiendo el usuario o la palabra BORRAR y, para limpiar datos, la contraseña de quien lo hace;
//  · borra en lotes con un tiempo máximo por llamada: si queda trabajo devuelve `terminado: false` y el panel vuelve a llamar;
//  · el registro de auditoría de seguridad no se toca.

const falla = (statusCode, code, mensaje) => Object.assign(new Error(mensaje), { statusCode, code });

export async function exigirModoPruebas() {
  if (!(await modoPruebasActivo())) throw falla(403, 'MODO_PRUEBAS_APAGADO', 'El modo pruebas está apagado. Enciéndelo en Seguridad para poder borrar datos.');
}

export const estadoModoPruebas = async () => ({ modo_pruebas: await modoPruebasActivo() });
export async function cambiarModoPruebas(activo, actorId) {
  const { anterior, nuevo } = await fijarModoPruebas(activo, actorId);
  return { anterior, nuevo };
}

// La contraseña de quien borra se vuelve a pedir; un error cuenta como intento fallido y bloquea la cuenta igual que en el inicio de sesión.
async function verificarClave(actorId, clave) {
  const actor = await sinEmpresa(() => prisma.usuario.findUnique({ where: { id_usuario: actorId } }));
  const correcta = actor ? await bcrypt.compare(String(clave || ''), actor.password_hash) : false;
  if (correcta) return;
  if (actor) {
    const intentos = actor.intentos_fallidos + 1;
    const bloquear = intentos >= env.MAX_LOGIN_FAILURES;
    await sinEmpresa(() => prisma.usuario.update({ where: { id_usuario: actor.id_usuario }, data: { intentos_fallidos: bloquear ? 0 : intentos, bloqueado_hasta: bloquear ? new Date(Date.now() + env.ACCOUNT_LOCK_MINUTES * 60_000) : actor.bloqueado_hasta } }));
  }
  throw falla(403, 'CLAVE_INCORRECTA', 'La contraseña no es correcta.');
}

// ---------------------------------------------------------------- piezas del borrado

// Borra en lotes lo que cumpla `where` (siempre de la empresa de la petición). Devuelve true si no queda nada y false si se acabó el tiempo.
async function borrarFilas({ modelo, id, where = {}, lote, presupuesto, seleccion = {}, contar, despues }) {
  for (;;) {
    if (!presupuesto.queda()) return false;
    const filas = await prisma[modelo].findMany({ where, select: { [id]: true, ...seleccion }, take: lote });
    if (!filas.length) return true;
    const { count } = await prisma[modelo].deleteMany({ where: { [id]: { in: filas.map((f) => f[id]) } } });
    presupuesto.hizoTrabajo();
    contar?.(count);
    if (despues) await despues(filas);
  }
}

// Borra los archivos de las fotos del almacén. Sin permiso de borrado (la cuenta de servicio del bucket) se dejan y se cuentan; cualquier otro
// fallo corta la llamada ANTES de borrar las filas, para que reintentar no deje fotos huérfanas.
async function borrarArchivos(fotos, estado) {
  for (let i = 0; i < fotos.length; i += 10) {
    await Promise.all(fotos.slice(i, i + 10).map(async (f) => {
      try { await storage.borrarEvidencia(f.object_key); } catch (error) {
        if (!esSinPermiso(error)) throw falla(502, 'ALMACEN_NO_RESPONDE', 'No se pudieron borrar las fotos del almacenamiento. Intenta de nuevo en un momento.');
        estado.archivosSinBorrar += 1;
        if (estado.clavesSinBorrar.length < 200) estado.clavesSinBorrar.push(f.object_key);
      }
    }));
  }
}

// Visitas con sus fotos (archivo y fila). Cada visita trae hasta 2 fotos que se borran una a una del almacén: lotes chicos.
async function borrarVisitas({ where = {}, presupuesto, lote, reajustar, borrado, estado }) {
  const porLote = Math.min(lote, 100);
  for (;;) {
    if (!presupuesto.queda()) return false;
    const visitas = await prisma.visitaAuditoria.findMany({ where, select: { id_visita: true, id_expediente: true }, take: porLote });
    if (!visitas.length) return true;
    const ids = visitas.map((v) => v.id_visita);
    const fotos = await prisma.evidencia.findMany({ where: { id_visita: { in: ids } }, select: { id_evidencia: true, object_key: true } });
    await borrarArchivos(fotos, estado);
    if (fotos.length) borrado.fotos += (await prisma.evidencia.deleteMany({ where: { id_evidencia: { in: fotos.map((f) => f.id_evidencia) } } })).count;
    borrado.visitas += (await prisma.visitaAuditoria.deleteMany({ where: { id_visita: { in: ids } } })).count;
    presupuesto.hizoTrabajo();
    if (reajustar) await reajustarEstados([...new Set(visitas.map((v) => v.id_expediente))]);
  }
}

// Tras quitar asignaciones o visitas de unos expedientes, su estado vuelve a lo que corresponde (ver estadoDespuesDeBorrar). No toca los Cerrados.
async function reajustarEstados(idsExpediente) {
  if (!idsExpediente.length) return;
  const expedientes = await prisma.expediente.findMany({ where: { id_expediente: { in: idsExpediente }, estado: { in: ['ASIGNADO', 'VISITADO'] } }, select: { id_expediente: true } });
  if (!expedientes.length) return;
  const ids = expedientes.map((e) => e.id_expediente);
  const activas = new Set((await prisma.asignacionAuditoria.findMany({ where: { id_expediente: { in: ids }, estado: 'ACTIVA' }, select: { id_expediente: true }, distinct: ['id_expediente'] })).map((a) => a.id_expediente));
  const visitados = new Set((await prisma.visitaAuditoria.findMany({ where: { id_expediente: { in: ids } }, select: { id_expediente: true }, distinct: ['id_expediente'] })).map((v) => v.id_expediente));
  const porEstado = { ASIGNADO: [], VISITADO: [], PENDIENTE: [] };
  for (const id of ids) porEstado[estadoDespuesDeBorrar({ tieneActiva: activas.has(id), tieneVisita: visitados.has(id) })].push(id);
  for (const [estado, lista] of Object.entries(porEstado)) {
    if (lista.length) await prisma.expediente.updateMany({ where: { id_expediente: { in: lista } }, data: { estado } });
  }
}

const idsDeExpedientes = (filas) => [...new Set(filas.map((f) => f.id_expediente))];

// ---------------------------------------------------------------- borrar un empleado por completo

async function usuarioDeLaEmpresa(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  if (!usuario) throw falla(404, 'NOT_FOUND', 'Usuario no encontrado');
  return usuario;
}

async function bloqueoDeBorrado(usuario, actorId) {
  const otrosAdminsActivos = usuario.rol === 'ADMINISTRADOR'
    ? await prisma.usuario.count({ where: { rol: 'ADMINISTRADOR', estado: 'ACTIVO', id_usuario: { not: usuario.id_usuario } } })
    : 1;
  return motivoQueImpideBorrar({ usuario, actorId, otrosAdminsActivos });
}

const resumenUsuario = (u) => ({ id: u.id_usuario, username: u.username, nombre: `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.username, rol: u.rol, estado: u.estado });
const CLAVES_USUARIO = ['visitas', 'fotos', 'asignaciones', 'ubicaciones', 'avisos_campo', 'jornadas', 'dispositivos', 'terminos'];

export async function vistaPreviaUsuario({ id, actorId }) {
  await exigirModoPruebas();
  const usuario = await usuarioDeLaEmpresa(id);
  const [visitas, fotos, asignaciones, ubicaciones, avisos, jornadas, dispositivos, terminos, bloqueo] = await Promise.all([
    prisma.visitaAuditoria.count({ where: { id_usuario_auditor: id } }),
    prisma.evidencia.count({ where: { visita: { id_usuario_auditor: id } } }),
    prisma.asignacionAuditoria.count({ where: { id_usuario_auditor: id } }),
    prisma.trackingUbicacion.count({ where: { id_usuario: id } }),
    prisma.eventoCampo.count({ where: { id_usuario: id } }),
    prisma.jornadaCampo.count({ where: { id_usuario: id } }),
    prisma.dispositivoAutorizado.count({ where: { id_usuario: id } }),
    prisma.aceptacionTerminos.count({ where: { usuario_id: id } }),
    bloqueoDeBorrado(usuario, actorId),
  ]);
  return { usuario: resumenUsuario(usuario), conteos: { visitas, fotos, asignaciones, ubicaciones, avisos_campo: avisos, jornadas, dispositivos, terminos }, bloqueo };
}

// Borra todo lo que cuelga de un usuario y, si no queda nada, al usuario mismo. Devuelve true si el usuario ya no existe y false si se acabó
// el tiempo (o le llegó un dato nuevo en este instante): quien llama vuelve a intentarlo.
async function borrarRastroYUsuario({ id, presupuesto, lote, borrado, estado }) {
  if (!(await borrarVisitas({ where: { id_usuario_auditor: id }, presupuesto, lote, reajustar: true, borrado, estado }))) return false;
  if (!(await borrarFilas({ modelo: 'eventoCampo', id: 'id_evento', where: { id_usuario: id }, lote, presupuesto, contar: (n) => { borrado.avisos_campo += n; } }))) return false;
  if (!(await borrarFilas({
    modelo: 'asignacionAuditoria', id: 'id_asignacion', where: { id_usuario_auditor: id }, lote, presupuesto, seleccion: { id_expediente: true },
    contar: (n) => { borrado.asignaciones += n; }, despues: (filas) => reajustarEstados(idsDeExpedientes(filas)),
  }))) return false;
  if (!(await borrarFilas({ modelo: 'trackingUbicacion', id: 'id_tracking', where: { id_usuario: id }, lote, presupuesto, contar: (n) => { borrado.ubicaciones += n; } }))) return false;
  if (!(await borrarFilas({ modelo: 'jornadaCampo', id: 'id_jornada', where: { id_usuario: id }, lote, presupuesto, contar: (n) => { borrado.jornadas += n; } }))) return false;
  borrado.dispositivos += (await prisma.dispositivoAutorizado.deleteMany({ where: { id_usuario: id } })).count;
  borrado.terminos += (await prisma.aceptacionTerminos.deleteMany({ where: { usuario_id: id } })).count;
  try { await prisma.usuario.delete({ where: { id_usuario: id } }); return true; } catch (error) {
    if (error?.code !== 'P2003') throw error; // le llegó un dato nuevo en este instante: la siguiente llamada lo borra
    return false;
  }
}

// El usuario se borra al final, cuando ya no tiene nada colgado. Si se acaba el tiempo antes, `terminado` es false y se vuelve a llamar:
// mientras tanto la cuenta queda inactiva (sin sesiones), así no entra a generar datos nuevos.
export async function borrarUsuario({ id, actorId, confirmar }) {
  await exigirModoPruebas();
  const usuario = await usuarioDeLaEmpresa(id);
  const bloqueo = await bloqueoDeBorrado(usuario, actorId);
  if (bloqueo) throw falla(409, bloqueo.code, bloqueo.mensaje);
  if (!confirmaUsuario(confirmar, usuario.username)) throw falla(400, 'CONFIRMACION_INCORRECTA', `Para confirmar escribe el usuario exacto: ${usuario.username}`);
  if (usuario.estado === 'ACTIVO') await prisma.usuario.update({ where: { id_usuario: id }, data: { estado: 'INACTIVO', token_version: { increment: 1 } } });

  const presupuesto = crearPresupuesto(env.LIMPIEZA_PRESUPUESTO_MS);
  const lote = env.LIMPIEZA_LOTE;
  const borrado = ceros(CLAVES_USUARIO);
  const estado = { archivosSinBorrar: 0, clavesSinBorrar: [] };
  const terminado = await borrarRastroYUsuario({ id, presupuesto, lote, borrado, estado });
  invalidarPuntos();
  return resultado({ terminado, borrado, estado, auditoria: { entidad: 'Usuario', entidad_id: id, valor_anterior: resumenUsuario(usuario) }, hecho: { eliminado: terminado } });
}

// ---------------------------------------------------------------- borrar a todos los asesores y supervisores

// Lo que se borra de una vez: los auditores de campo (asesores) y los supervisores, con todo lo suyo. Los administradores no se tocan.
const ROLES_EMPLEADO = ['AUDITOR', 'SUPERVISOR'];
const CLAVES_EMPLEADOS = ['usuarios', ...CLAVES_USUARIO];
const MAX_LISTA = 60;
const SELECCION_USUARIO = { id_usuario: true, username: true, nombres: true, apellidos: true, rol: true, estado: true };

// Quién se borraría (hasta 60 nombres; `total` es el número real), quién se queda y cuánto trabajo de campo se va con ellos.
export async function vistaPreviaEmpleados() {
  await exigirModoPruebas();
  const enAlcance = { rol: { in: ROLES_EMPLEADO } };
  const [total, porRol, lista, quedan, visitas, fotos, asignaciones, ubicaciones, avisos, jornadas] = await Promise.all([
    prisma.usuario.count({ where: enAlcance }),
    prisma.usuario.groupBy({ by: ['rol'], where: enAlcance, _count: { _all: true } }),
    prisma.usuario.findMany({ where: enAlcance, select: SELECCION_USUARIO, orderBy: [{ rol: 'asc' }, { username: 'asc' }], take: MAX_LISTA }),
    prisma.usuario.findMany({ where: { rol: { notIn: ROLES_EMPLEADO } }, select: SELECCION_USUARIO, orderBy: { username: 'asc' }, take: 20 }),
    prisma.visitaAuditoria.count({ where: { auditor: enAlcance } }),
    prisma.evidencia.count({ where: { visita: { auditor: enAlcance } } }),
    prisma.asignacionAuditoria.count({ where: { auditor: enAlcance } }),
    prisma.trackingUbicacion.count({ where: { usuario: enAlcance } }),
    prisma.eventoCampo.count({ where: { usuario: enAlcance } }),
    prisma.jornadaCampo.count({ where: { usuario: enAlcance } }),
  ]);
  return {
    total, por_rol: Object.fromEntries(porRol.map((r) => [r.rol, r._count._all])),
    usuarios: lista.map(resumenUsuario), mostrando: lista.length, quedan: quedan.map(resumenUsuario),
    conteos: { visitas, fotos, asignaciones, ubicaciones, avisos_campo: avisos, jornadas },
  };
}

// Pide la palabra BORRAR y la contraseña de quien lo hace. Las cuentas se desactivan de una vez (sin sesiones) y se borran en lotes con un tiempo
// máximo por llamada; si queda trabajo devuelve `terminado: false` y el panel vuelve a llamar.
export async function borrarEmpleados({ actorId, confirmar, clave }) {
  await exigirModoPruebas();
  if (!confirmaLimpieza(confirmar)) throw falla(400, 'CONFIRMACION_INCORRECTA', 'Para confirmar escribe BORRAR.');
  await verificarClave(actorId, clave);
  await prisma.usuario.updateMany({ where: { rol: { in: ROLES_EMPLEADO }, estado: 'ACTIVO' }, data: { estado: 'INACTIVO', token_version: { increment: 1 } } });

  const presupuesto = crearPresupuesto(env.LIMPIEZA_PRESUPUESTO_MS);
  const lote = env.LIMPIEZA_LOTE;
  const borrado = ceros(CLAVES_EMPLEADOS);
  const estado = { archivosSinBorrar: 0, clavesSinBorrar: [] };
  let terminado = false;
  for (;;) {
    if (!presupuesto.queda()) break;
    const lista = await prisma.usuario.findMany({ where: { rol: { in: ROLES_EMPLEADO } }, select: { id_usuario: true }, take: 25 });
    if (!lista.length) { terminado = true; break; }
    let alguno = false;
    for (const { id_usuario: id } of lista) {
      if (await borrarRastroYUsuario({ id, presupuesto, lote, borrado, estado })) { borrado.usuarios += 1; alguno = true; } else if (!presupuesto.queda()) break;
    }
    if (!alguno) break; // sin tiempo, o ninguno se pudo terminar: se devuelve lo que falta
  }
  invalidarPuntos();
  return resultado({ terminado, borrado, estado, auditoria: { entidad: 'Limpieza', entidad_id: 'empleados', valor_anterior: null }, hecho: { roles: ROLES_EMPLEADO } });
}

// ---------------------------------------------------------------- limpiar los datos cargados

const CLAVES_DATOS = ['visitas', 'fotos', 'asignaciones', 'ubicaciones', 'avisos_campo', 'jornadas', 'expedientes', 'cargas_excel', 'expedientes_a_pendiente'];

export async function vistaPreviaDatos(alcance) {
  await exigirModoPruebas();
  const todo = alcance === 'todo';
  const [visitas, fotos, asignaciones, ubicaciones, avisos, jornadas, expedientes, cargas, aPendiente] = await Promise.all([
    prisma.visitaAuditoria.count(), prisma.evidencia.count(), prisma.asignacionAuditoria.count(), prisma.trackingUbicacion.count(), prisma.eventoCampo.count(), prisma.jornadaCampo.count(),
    todo ? prisma.expediente.count() : 0, todo ? prisma.importacionMasiva.count() : 0,
    todo ? 0 : prisma.expediente.count({ where: { estado: { in: ['ASIGNADO', 'VISITADO'] } } }),
  ]);
  return { alcance, conteos: { visitas, fotos, asignaciones, ubicaciones, avisos_campo: avisos, jornadas, ...(todo ? { expedientes, cargas_excel: cargas } : { expedientes_a_pendiente: aPendiente }) } };
}

// Los casos que se conservan vuelven a Pendiente (siguen en la base, otra vez asignables).
async function reiniciarExpedientes({ lote, presupuesto, borrado }) {
  for (;;) {
    if (!presupuesto.queda()) return false;
    const filas = await prisma.expediente.findMany({ where: { estado: { in: ['ASIGNADO', 'VISITADO'] } }, select: { id_expediente: true }, take: lote });
    if (!filas.length) return true;
    borrado.expedientes_a_pendiente += (await prisma.expediente.updateMany({ where: { id_expediente: { in: filas.map((f) => f.id_expediente) } }, data: { estado: 'PENDIENTE' } })).count;
    presupuesto.hizoTrabajo();
  }
}

// El mapa en vivo y la jornada de cada auditor también se vacían (son la «última ubicación» guardada en la cuenta).
const sinUbicacion = { latitud: null, longitud: null, ubicacion_en: null, ubicacion_precision: null, ubicacion_simulada: false, bateria_porcentaje: null, bateria_cargando: false, mov_estado: null, mov_desde: null, mov_velocidad: null, mov_modo: null, jornada_inicio: null, jornada_fin: null, zona_distrito: null, zona_provincia: null, zona_departamento: null, zona_en: null };

export async function limpiarDatos({ alcance, actorId, confirmar, clave }) {
  await exigirModoPruebas();
  if (!confirmaLimpieza(confirmar)) throw falla(400, 'CONFIRMACION_INCORRECTA', 'Para confirmar escribe BORRAR.');
  await verificarClave(actorId, clave);

  const presupuesto = crearPresupuesto(env.LIMPIEZA_PRESUPUESTO_MS);
  const lote = env.LIMPIEZA_LOTE;
  const borrado = ceros(CLAVES_DATOS);
  const estado = { archivosSinBorrar: 0, clavesSinBorrar: [] };
  let terminado = false;
  paso: {
    // Del más dependiente al menos: fotos y visitas, avisos, asignaciones, ubicaciones; después los expedientes (o su vuelta a Pendiente).
    if (!(await borrarVisitas({ presupuesto, lote, reajustar: false, borrado, estado }))) break paso;
    if (!(await borrarFilas({ modelo: 'eventoCampo', id: 'id_evento', lote, presupuesto, contar: (n) => { borrado.avisos_campo += n; } }))) break paso;
    if (!(await borrarFilas({ modelo: 'asignacionAuditoria', id: 'id_asignacion', lote, presupuesto, contar: (n) => { borrado.asignaciones += n; } }))) break paso;
    if (!(await borrarFilas({ modelo: 'trackingUbicacion', id: 'id_tracking', lote, presupuesto, contar: (n) => { borrado.ubicaciones += n; } }))) break paso;
    if (!(await borrarFilas({ modelo: 'jornadaCampo', id: 'id_jornada', lote, presupuesto, contar: (n) => { borrado.jornadas += n; } }))) break paso;
    if (alcance === 'todo') {
      if (!(await borrarFilas({ modelo: 'expediente', id: 'id_expediente', lote: Math.min(lote, 500), presupuesto, contar: (n) => { borrado.expedientes += n; } }))) break paso;
      if (!(await borrarFilas({ modelo: 'importacionMasiva', id: 'id_importacion', lote, presupuesto, contar: (n) => { borrado.cargas_excel += n; } }))) break paso;
    } else if (!(await reiniciarExpedientes({ lote, presupuesto, borrado }))) break paso;
    await prisma.usuario.updateMany({ data: sinUbicacion });
    terminado = true;
  }
  invalidarPuntos();
  return resultado({ terminado, borrado, estado, auditoria: { entidad: 'Limpieza', entidad_id: alcance, valor_anterior: null }, hecho: { alcance } });
}

// Forma común de la respuesta y de lo que queda en el registro de auditoría. Las fotos que no se pudieron borrar del almacén se avisan y sus
// claves se dejan en el registro del servidor para quitarlas a mano.
function resultado({ terminado, borrado, estado, auditoria, hecho }) {
  if (estado.archivosSinBorrar) logger.warn({ evento: 'limpieza_archivos_sin_borrar', cantidad: estado.archivosSinBorrar, claves: estado.clavesSinBorrar }, 'fotos que el almacenamiento no dejó borrar');
  const valorNuevo = { ...hecho, terminado, borrado, archivos_sin_borrar: estado.archivosSinBorrar };
  return { terminado, borrado, archivos_sin_borrar: estado.archivosSinBorrar, _auditDiff: { ...auditoria, valor_nuevo: valorNuevo } };
}
