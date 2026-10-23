// Catálogo de eventos de seguridad: convierte «método + ruta (+ cambios)» en una acción legible, con categoría y gravedad. Son funciones puras, sin
// base de datos, para probarlas solas. La clasificación (acción, categoría y gravedad) se guarda al registrar el evento, para poder filtrar con
// índices; el texto se arma al mostrarlo, así la redacción se puede mejorar sin tocar los registros ya guardados.

export const CATEGORIAS = Object.freeze({
  ACCESO: 'Accesos', USUARIOS: 'Usuarios', ASIGNACIONES: 'Asignaciones', EXPEDIENTES: 'Expedientes', VISITAS: 'Visitas',
  CONFIGURACION: 'Configuración', BORRADO: 'Borrado de datos', CONSULTA: 'Consultas de datos', OTRO: 'Otros',
});
// INFO: lo normal del trabajo diario. AVISO: conviene que alguien lo vea. CRITICO: da o quita poder, borra datos o toca la seguridad.
export const SEVERIDADES = Object.freeze(['INFO', 'AVISO', 'CRITICO']);
export const RESULTADOS = Object.freeze(['ok', 'error']);

const ROL = { ADMINISTRADOR: 'Administrador', SUPERVISOR: 'Supervisor', AUDITOR: 'Asesor de campo', UNIVERSAL: 'Administrador universal' };
const rol = (r) => ROL[r] || r || 'sin rol';
const num = (n) => Number(n || 0).toLocaleString('es-PE');
const casos = (n) => `${num(n)} ${Number(n) === 1 ? 'caso' : 'casos'}`;

// @usuario del que habla el evento: el nombre que se resolvió en la base o, si no, el que quedó en el cambio guardado.
const usuario = (c) => c.objetivo || ((c.nuevo?.username || c.anterior?.username) ? `@${c.nuevo?.username || c.anterior?.username}` : 'un usuario');
// El expediente del que habla el evento: el que se resolvió en la base o, si ya no existe (se eliminó), el código que quedó en el cambio guardado.
const expediente = (c) => {
  if (c.objetivo) return c.objetivo;
  const codigo = c.nuevo?.codigo_expediente || c.anterior?.codigo_expediente;
  return codigo ? `el expediente ${codigo}` : 'un expediente';
};

const ID = '(\\d+)';
const UUID = '([0-9a-fA-F-]{36})';
const regla = (metodos, patron, def) => ({ metodos: metodos.split('|'), patron: new RegExp(`^${patron}/?$`), def });
const def = (categoria, accion, severidad, titulo, ref) => ({ categoria, accion, severidad, titulo, ...(ref ? { ref } : {}) });

const MOTIVO = { ENFERMEDAD: 'enfermedad', RETIRO: 'retiro', REASIGNACION: 'reasignación de carga', OTRO: 'otro motivo' };

const REGLAS = [
  // ---------------------------------------------------------------- Accesos
  regla('POST', '/api/auth/login', (c) => {
    if (c.estado < 400) return def('ACCESO', 'ACCESO_EXITOSO', 'INFO', 'Inició sesión');
    if (c.estado === 423) return def('ACCESO', 'ACCESO_BLOQUEADO', 'AVISO', 'Intentó entrar a una cuenta bloqueada');
    if (c.estado === 429) return def('ACCESO', 'ACCESO_LIMITE', 'AVISO', 'Demasiados intentos de acceso seguidos');
    return def('ACCESO', 'ACCESO_FALLIDO', 'AVISO', 'Intento de acceso fallido');
  }),
  regla('POST', '/api/auth/sso', (c) => (c.estado < 400
    ? def('ACCESO', 'ACCESO_EXITOSO', 'INFO', 'Inició sesión con su cuenta Sulotec')
    : def('ACCESO', 'ACCESO_FALLIDO', 'AVISO', 'Intento de acceso con la cuenta Sulotec rechazado'))),
  regla('POST', '/api/auth/mfa/verify', (c) => (c.estado < 400
    ? def('ACCESO', 'ACCESO_MFA', 'INFO', 'Verificó su segundo factor al iniciar sesión')
    : def('ACCESO', 'ACCESO_FALLIDO', 'AVISO', 'Código de verificación en dos pasos incorrecto'))),
  regla('POST', '/api/auth/mfa/(?:enroll/)?(?:setup|confirm)', () => def('ACCESO', 'ACCESO_MFA_CONFIGURAR', 'INFO', 'Configuró la verificación en dos pasos')),
  regla('POST', '/api/auth/mfa/disable', () => def('ACCESO', 'ACCESO_MFA_DESACTIVAR', 'AVISO', 'Desactivó su verificación en dos pasos')),
  regla('POST', '/api/auth/logout', () => def('ACCESO', 'ACCESO_CIERRE', 'INFO', 'Cerró sesión')),
  regla('POST', '/api/terminos/aceptar', () => def('ACCESO', 'ACCESO_TERMINOS', 'INFO', 'Aceptó los términos y condiciones')),

  // ---------------------------------------------------------------- Usuarios
  regla('POST', '/api/usuarios', (c) => def('USUARIOS', 'USUARIO_CREAR', c.nuevo?.rol === 'ADMINISTRADOR' ? 'AVISO' : 'INFO',
    c.nuevo?.rol === 'ADMINISTRADOR' ? `Creó un administrador: ${usuario(c)}` : `Creó el usuario ${usuario(c)}`)),
  regla('PUT|PATCH', `/api/usuarios/${UUID}`, (c) => {
    const a = c.anterior; const n = c.nuevo; const ref = { tipo: 'Usuario', id: c.m[1] };
    if (a && n && a.rol !== n.rol) return def('USUARIOS', 'USUARIO_CAMBIAR_ROL', 'CRITICO', `Cambió el rol de ${usuario(c)}: ${rol(a.rol)} → ${rol(n.rol)}`, ref);
    if (n?.clave_cambiada) return def('USUARIOS', 'USUARIO_CAMBIAR_CLAVE', 'CRITICO', `Cambió la contraseña de ${usuario(c)}`, ref);
    if (a && n && a.estado !== n.estado) {
      return n.estado === 'INACTIVO'
        ? def('USUARIOS', 'USUARIO_DESACTIVAR', 'AVISO', `Desactivó la cuenta de ${usuario(c)}`, ref)
        : def('USUARIOS', 'USUARIO_ACTIVAR', 'INFO', `Activó la cuenta de ${usuario(c)}`, ref);
    }
    if (a && n && (a.mfa_requerido !== n.mfa_requerido || a.mfa_exento !== n.mfa_exento)) {
      return def('USUARIOS', 'USUARIO_CAMBIAR_MFA', 'AVISO', `Cambió la exigencia de verificación en dos pasos de ${usuario(c)}`, ref);
    }
    return def('USUARIOS', 'USUARIO_EDITAR', 'INFO', `Editó los datos de ${usuario(c)}`, ref);
  }),
  regla('POST', `/api/usuarios/${UUID}/mfa/reset`, (c) => def('USUARIOS', 'USUARIO_RESET_MFA', 'CRITICO', `Restableció la verificación en dos pasos de ${usuario(c)}`, { tipo: 'Usuario', id: c.m[1] })),
  regla('POST', `/api/usuarios/${UUID}/device/reset`, (c) => def('USUARIOS', 'USUARIO_LIBERAR_DISPOSITIVO', 'AVISO', `Liberó el dispositivo de ${usuario(c)}`, { tipo: 'Usuario', id: c.m[1] })),
  regla('DELETE', `/api/usuarios/${UUID}`, (c) => def('USUARIOS', 'USUARIO_ELIMINAR', 'CRITICO', `Eliminó la cuenta de ${usuario(c)}`, { tipo: 'Usuario', id: c.m[1] })),

  // ---------------------------------------------------------------- Asignaciones
  regla('POST', '/api/asignaciones', () => def('ASIGNACIONES', 'ASIGNACION_CREAR', 'INFO', 'Asignó un caso a un asesor')),
  regla('POST', '/api/asignaciones/masivo', () => def('ASIGNACIONES', 'ASIGNACION_MASIVA', 'INFO', 'Asignó varios casos a un asesor')),
  regla('POST', `/api/asignaciones/auto/${ID}`, (c) => def('ASIGNACIONES', 'ASIGNACION_TOMAR', 'INFO', `Tomó ${expediente(c)} por su cuenta`, { tipo: 'Expediente', id: c.m[1] })),
  regla('POST', `/api/asignaciones/${ID}/cancelar`, () => def('ASIGNACIONES', 'ASIGNACION_CANCELAR', 'INFO', 'Canceló una asignación')),
  regla('POST', '/api/asignaciones/quitar', (c) => def('ASIGNACIONES', 'ASIGNACION_QUITAR', 'AVISO',
    `Quitó ${c.nuevo?.quitadas != null ? casos(c.nuevo.quitadas) : 'casos'} a ${c.objetivo || 'un asesor'}${MOTIVO[c.nuevo?.motivo] ? ` (${MOTIVO[c.nuevo.motivo]})` : ''}`)),
  regla('POST', '/api/asignaciones/liberar', () => def('ASIGNACIONES', 'ASIGNACION_LIBERAR', 'INFO', 'Dejó disponibles los casos pendientes para los asesores')),
  regla('PUT', '/api/asignaciones/autoasignacion', (c) => def('CONFIGURACION', 'CONFIG_TOMA_CASOS', 'AVISO',
    c.nuevo?.activa === false ? 'Desactivó que los asesores tomen casos por su cuenta' : 'Activó que los asesores tomen casos por su cuenta')),
  regla('PUT', '/api/asignaciones/tope-casos', (c) => def('CONFIGURACION', 'CONFIG_TOPE_CASOS', 'AVISO',
    `Cambió el máximo de casos abiertos por asesor${c.anterior?.maximo != null && c.nuevo?.maximo != null ? `: ${num(c.anterior.maximo)} → ${num(c.nuevo.maximo)}` : ''}`)),

  // ---------------------------------------------------------------- Expedientes
  regla('POST', '/api/expedientes/importar', (c) => def('EXPEDIENTES', 'EXPEDIENTE_IMPORTAR', 'INFO',
    c.nuevo?.simulacion ? 'Revisó un Excel de expedientes (sin guardar)' : 'Cargó un Excel de expedientes')),
  regla('POST', '/api/expedientes/importaciones/[0-9a-fA-F-]{36}/liberar', () => def('EXPEDIENTES', 'EXPEDIENTE_LIBERAR', 'INFO', 'Dejó disponibles los casos de una carga de Excel')),
  regla('POST', '/api/expedientes/geocodificacion/(?:procesar|reencolar)', () => def('EXPEDIENTES', 'EXPEDIENTE_UBICACION', 'INFO', 'Procesó direcciones de expedientes')),
  regla('POST', `/api/expedientes/${ID}/(?:geocodificar|aceptar-ubicacion)`, (c) => def('EXPEDIENTES', 'EXPEDIENTE_UBICACION', 'INFO', `Fijó la ubicación de ${expediente(c)}`, { tipo: 'Expediente', id: c.m[1] })),
  regla('POST', '/api/expedientes', () => def('EXPEDIENTES', 'EXPEDIENTE_CREAR', 'INFO', 'Creó un expediente')),
  regla('PUT', `/api/expedientes/${ID}`, (c) => def('EXPEDIENTES', 'EXPEDIENTE_EDITAR', 'INFO', `Editó ${expediente(c)}`, { tipo: 'Expediente', id: c.m[1] })),
  regla('PUT', `/api/expedientes/${ID}/negocios/\\d+/ubicacion`, (c) => def('EXPEDIENTES', 'EXPEDIENTE_UBICACION', 'INFO', `Fijó la ubicación de un negocio de ${expediente(c)}`, { tipo: 'Expediente', id: c.m[1] })),
  regla('DELETE', `/api/expedientes/${ID}`, (c) => def('EXPEDIENTES', 'EXPEDIENTE_ELIMINAR', 'CRITICO', `Eliminó ${expediente(c)}`, { tipo: 'Expediente', id: c.m[1] })),

  // ---------------------------------------------------------------- Visitas (campo)
  regla('POST', '/api/visitas', () => def('VISITAS', 'VISITA_ENVIAR', 'INFO', 'Envió una visita')),
  regla('POST', '/api/visitas/jornada', () => def('VISITAS', 'VISITA_JORNADA', 'INFO', 'Registró su jornada de campo')),
  regla('POST', '/api/visitas/evidencias/presign', () => def('VISITAS', 'VISITA_FOTO', 'INFO', 'Preparó la subida de una foto de evidencia')),
  regla('PUT', '/api/visitas/evidencias/upload/[^/]+', () => def('VISITAS', 'VISITA_FOTO', 'INFO', 'Subió una foto de evidencia')),
  regla('PATCH', '/api/visitas/ubicacion', () => def('VISITAS', 'VISITA_UBICACION', 'INFO', 'No se pudo guardar su ubicación')),

  // ---------------------------------------------------------------- Configuración
  regla('POST', '/api/empresas', () => def('CONFIGURACION', 'CONFIG_EMPRESA', 'AVISO', 'Creó una empresa')),
  regla('PUT', `/api/empresas/${UUID}`, () => def('CONFIGURACION', 'CONFIG_EMPRESA', 'AVISO', 'Cambió los datos de una empresa')),
  regla('PUT', '/api/limpieza/modo-pruebas', (c) => (c.nuevo?.activo === false
    ? def('CONFIGURACION', 'CONFIG_MODO_PRUEBAS', 'AVISO', 'Apagó el modo pruebas')
    : def('CONFIGURACION', 'CONFIG_MODO_PRUEBAS', 'CRITICO', 'Encendió el modo pruebas (permite borrar datos y empleados)'))),

  // ---------------------------------------------------------------- Borrado de datos (modo pruebas)
  regla('POST', '/api/limpieza/datos', (c) => def('BORRADO', 'BORRADO_DATOS', 'CRITICO',
    `Limpió datos de prueba${c.nuevo?.alcance ? ` (${c.nuevo.alcance === 'todo' ? 'todo lo cargado' : 'solo la actividad de campo'})` : ''}`)),
  regla('POST', `/api/limpieza/usuarios/${UUID}`, (c) => def('BORRADO', 'BORRADO_USUARIO', 'CRITICO', `Borró por completo la cuenta de ${usuario(c)}`, { tipo: 'Usuario', id: c.m[1] })),
  regla('POST', '/api/limpieza/empleados', () => def('BORRADO', 'BORRADO_EMPLEADOS', 'CRITICO', 'Borró a todos los asesores y supervisores')),

  // ---------------------------------------------------------------- Consultas de datos sensibles (solo lecturas que se auditan)
  regla('GET', `/api/expedientes/${ID}`, (c) => def('CONSULTA', 'CONSULTA_EXPEDIENTE', 'INFO', `Consultó ${expediente(c)}`, { tipo: 'Expediente', id: c.m[1] })),
  regla('GET', `/api/visitas/${ID}`, (c) => def('CONSULTA', 'CONSULTA_VISITA', 'INFO', `Consultó la visita n.º ${c.m[1]}`, { tipo: 'VisitaAuditoria', id: c.m[1] })),
  regla('GET', `/api/reportes/visita/${ID}/word`, (c) => def('CONSULTA', 'CONSULTA_FICHA_WORD', 'AVISO', `Descargó la ficha en Word de la visita n.º ${c.m[1]}`, { tipo: 'VisitaAuditoria', id: c.m[1] })),
  regla('GET', `/api/usuarios/${UUID}/tracking`, (c) => def('CONSULTA', 'CONSULTA_RECORRIDO', 'INFO', `Consultó el recorrido de ${usuario(c)}`, { tipo: 'Usuario', id: c.m[1] })),
  regla('GET', '/api/seguridad/exportar', () => def('CONSULTA', 'SEGURIDAD_EXPORTAR', 'AVISO', 'Exportó el registro de auditoría')),
];

const sinRuta = (metodo, ruta) => def('OTRO', 'OTRO', 'INFO', `${metodo} ${ruta}`);

// Clasifica un evento. `estado` es el código HTTP; `anterior` y `nuevo` son los valores guardados del cambio (si los hay); `objetivo` es el nombre ya
// resuelto de quien recibió la acción (por ejemplo «@juan»). Devuelve { categoria, accion, severidad, titulo, ref? }.
export function clasificar({ metodo, ruta, estado = 200, anterior = null, nuevo = null, objetivo = null }) {
  const limpia = String(ruta || '').split('?')[0];
  const m = String(metodo || '').toUpperCase();
  for (const r of REGLAS) {
    if (!r.metodos.includes(m)) continue;
    const ok = r.patron.exec(limpia);
    if (!ok) continue;
    const base = r.def({ m: ok, estado, anterior, nuevo, objetivo, ruta: limpia });
    return endurecer(base, { estado, metodo: m, ruta: limpia });
  }
  return endurecer(sinRuta(m, limpia), { estado, metodo: m, ruta: limpia });
}

// Lo que el servidor rechaza por permisos o por sesión también es una señal: un 403 es alguien probando algo que no le toca (AVISO); un 401 fuera del
// login es una sesión vencida o un token inválido (lo normal, INFO). En el login ya lo resuelve su propia regla.
function endurecer(base, { estado, metodo, ruta }) {
  if (base.accion.startsWith('ACCESO_')) return base;
  if (estado === 403) return def('ACCESO', 'ACCESO_DENEGADO', 'AVISO', `Intentó algo sin permiso: ${base.titulo}`);
  if (estado === 401) return def('ACCESO', 'SESION_INVALIDA', 'INFO', `Sesión vencida o no válida (${metodo} ${ruta})`);
  return base;
}

// ¿Esta lectura (GET) se guarda en el registro? Solo las de datos personales de clientes y de empleados, las descargas y las exportaciones.
const REGLAS_DE_LECTURA = REGLAS.filter((r) => r.metodos.includes('GET')); // se consulta en cada GET del servidor: solo las pocas reglas de lectura
export function esLecturaAuditada(ruta) {
  const limpia = String(ruta || '').split('?')[0];
  return REGLAS_DE_LECTURA.some((r) => r.patron.test(limpia));
}

// Cómo se cuentan, en plural, las operaciones críticas de la lista «Requiere atención».
export const PLURAL_CRITICO = Object.freeze({
  USUARIO_CAMBIAR_ROL: 'cambios de rol', USUARIO_CAMBIAR_CLAVE: 'contraseñas cambiadas por un administrador',
  USUARIO_RESET_MFA: 'restablecimientos de la verificación en dos pasos', USUARIO_ELIMINAR: 'cuentas eliminadas',
  EXPEDIENTE_ELIMINAR: 'expedientes eliminados', CONFIG_MODO_PRUEBAS: 'veces que se encendió el modo pruebas',
  BORRADO_DATOS: 'limpiezas de datos de prueba', BORRADO_USUARIO: 'cuentas borradas por completo', BORRADO_EMPLEADOS: 'borrados de todos los empleados',
});
