// Piezas puras del modo pruebas (borrar empleados y limpiar datos cargados): sin base de datos, para probarlas solas.

export const FRASE_LIMPIEZA = 'BORRAR';

// Qué se limpia. `campo`: la actividad de los auditores (visitas con sus fotos, asignaciones, ubicaciones y avisos); los expedientes se
// quedan y vuelven a Pendiente. `todo`: lo anterior más los expedientes cargados y el historial de cargas de Excel. Los usuarios, los
// ajustes y el registro de auditoría de seguridad nunca se tocan aquí.
export const ALCANCES = Object.freeze(['campo', 'todo']);

// Tiempo que tiene una llamada para borrar. El borrado va en lotes; si el tiempo se acaba se devuelve lo que falta y el panel vuelve a
// llamar hasta que termine (así ninguna petición se queda minutos abierta ni una sentencia gigante bloquea la base).
// Cada llamada hace al menos un lote aunque el plazo ya haya pasado (revisar categorías vacías también gasta tiempo): sin eso, con una base
// lenta, el panel podría llamar una y otra vez sin que nada avance.
export function crearPresupuesto(ms, ahora = () => Date.now()) {
  const fin = ahora() + ms;
  let trabajo = false;
  return { queda: () => !trabajo || ahora() < fin, hizoTrabajo: () => { trabajo = true; } };
}

// Estado de un expediente cuando se le quitan asignaciones o visitas: con una asignación activa sigue Asignado; si no, con alguna visita
// que quede (de otro auditor) sigue Visitado; si no le queda nada, vuelve a Pendiente (otra vez disponible para asignarse).
export function estadoDespuesDeBorrar({ tieneActiva, tieneVisita }) {
  if (tieneActiva) return 'ASIGNADO';
  return tieneVisita ? 'VISITADO' : 'PENDIENTE';
}

// Para borrar un empleado se escribe su usuario (sin importar mayúsculas); para limpiar los datos, la palabra BORRAR.
export const confirmaUsuario = (escrito, username) => String(escrito ?? '').trim().toLowerCase() === String(username ?? '').trim().toLowerCase() && String(username ?? '').length > 0;
export const confirmaLimpieza = (escrito) => String(escrito ?? '').trim().toUpperCase() === FRASE_LIMPIEZA;

// Quién no se puede borrar: uno mismo, y el último administrador activo de la empresa (nadie podría volver a entrar al panel).
// Devuelve null si se puede, o { code, mensaje }.
export function motivoQueImpideBorrar({ usuario, actorId, otrosAdminsActivos }) {
  if (usuario.id_usuario === actorId) return { code: 'NO_PUEDE_BORRARSE_A_SI_MISMO', mensaje: 'No puedes borrar tu propia cuenta.' };
  if (usuario.rol === 'ADMINISTRADOR' && usuario.estado === 'ACTIVO' && otrosAdminsActivos < 1) {
    return { code: 'ULTIMO_ADMINISTRADOR', mensaje: 'Es el único administrador activo de la empresa: crea otro antes de borrarlo.' };
  }
  return null;
}

// Un fallo del almacén de fotos que no se arregla reintentando (la cuenta de servicio no tiene permiso de borrar): las fotos se dejan y se avisa.
// Cualquier otro fallo (red, tiempo agotado) sí se reintenta: se corta la llamada antes de borrar las filas.
export function esSinPermiso(error) {
  const http = error?.$metadata?.httpStatusCode ?? error?.statusCode;
  return http === 403 || ['AccessDenied', 'Forbidden', 'NotAuthorized', 'AccessDeniedException'].includes(error?.name || error?.code);
}

export const ceros = (claves) => Object.fromEntries(claves.map((k) => [k, 0]));
