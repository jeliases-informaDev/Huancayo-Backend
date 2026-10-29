import { z } from 'zod';
import { MOTIVOS_QUITAR, DESTINOS_QUITAR } from '../modules/auditorias/casos.core.js';
import { CATEGORIAS, SEVERIDADES, RESULTADOS } from '../modules/sistema/seguridad.catalogo.js';

const cleanString = max => z.string().trim().min(1).max(max);
const optionalString = max => z.string().trim().max(max).optional();

export const idParams = z.object({ id: z.coerce.number().int().positive() }).strict();
export const uuidParams = z.object({ id: z.string().uuid() }).strict();
export const evidenciaParams = z.object({ idEvidencia: z.string().uuid() }).strict();

// --- Auth ---
export const loginBody = z.object({ username: cleanString(50), password: z.string().min(1).max(128) }).strict();
// Inicio con la cuenta Sulotec: código de autorización + verificador PKCE + dirección de retorno (debe ser la del panel).
export const ssoBody = z.object({ code: z.string().min(10).max(4096), codeVerifier: z.string().min(43).max(128), redirectUri: z.string().url().max(300) }).strict();
// `tipo` solo cambia las filas de ejemplo de la plantilla SIMPLE (Modelo Consumo / Modelo MYPE); la base del core se distingue por el nombre de la hoja.
export const plantillaQuery = z.object({ formato: z.enum(['CORE_262', 'SIMPLE']).default('CORE_262'), tipo: z.enum(['CONSUMO', 'OTROS']).optional() }).strict();
// Asesores ya cargados en los expedientes (sugerencias al crear un expediente a mano).
export const asesoresQuery = z.object({ q: z.string().trim().max(100).optional(), limit: z.coerce.number().int().min(1).max(200).optional() }).strict();
export const mfaVerifyBody = z.object({ challengeToken: z.string().min(20).max(4096), code: z.string().regex(/^\d{6}$/) }).strict();
export const mfaChallengeBody = z.object({ challengeToken: z.string().min(20).max(4096) }).strict();
export const mfaCodeBody = z.object({ code: z.string().regex(/^\d{6}$/) }).strict();
export const passwordBody = z.object({ password: z.string().min(1).max(128) }).strict();

// --- Usuarios ---
export const userCreateBody = z.object({
  username: cleanString(50).regex(/^[A-Za-z0-9._-]+$/, 'El usuario contiene caracteres no permitidos'),
  password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres').max(128, 'La contraseña no puede superar 128 caracteres'),
  rol: z.enum(['ADMINISTRADOR', 'SUPERVISOR', 'AUDITOR', 'UNIVERSAL']),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(), nombres: z.string().max(150).optional(),
  apellidos: z.string().max(200).optional(), email: z.string().email().max(150).optional().or(z.literal('')),
  sede: z.string().max(100).optional(), mfa_habilitado: z.boolean().optional(),
  departamento: z.string().max(100).optional(),
}).strict();
export const userUpdateBody = userCreateBody.partial().refine(data => Object.keys(data).length > 0, 'Debe enviar al menos un campo');

// Listas del panel (Usuarios y Asignaciones): por páginas y con la búsqueda y los filtros en el servidor.
const paginaQuery = {
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};
export const usuariosListQuery = z.object({
  ...paginaQuery,
  q: z.string().trim().max(100).optional(),
  rol: z.enum(['ADMINISTRADOR', 'SUPERVISOR', 'AUDITOR', 'UNIVERSAL']).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
}).strict();
// Auditores de campo activos. Sin page ni limit (selectores de otras pantallas) devuelve la lista completa, como siempre.
export const auditoresQuery = z.object({
  ...paginaQuery,
  q: z.string().trim().max(100).optional(),
  zona: z.string().trim().max(100).optional(),
  id: z.string().uuid().optional(), // un auditor concreto (enlaces con el auditor ya elegido)
}).strict();
// Expedientes sin asignar (columna central de Asignaciones) y los distritos que tienen.
export const pendientesQuery = z.object({
  ...paginaQuery,
  q: z.string().trim().max(100).optional(),
  tipo: z.enum(['CONSUMO', 'OTROS']).optional(),
  distrito: z.string().trim().max(100).optional(),
}).strict();
export const pendientesDistritosQuery = z.object({ tipo: z.enum(['CONSUMO', 'OTROS']).optional() }).strict();

// --- Listados ---
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  search: z.string().trim().max(150).optional(), estado: z.string().trim().max(30).optional(),
  distrito: z.string().trim().max(100).optional(),
  departamento: z.string().trim().max(100).optional(),
  tipo_credito: z.enum(['CONSUMO', 'OTROS']).optional(),
  auditor: z.string().uuid().optional(), // asignaciones de un auditor
  sin_ubicacion: z.enum(['true', 'false']).optional(),
  // Situación de la dirección en el mapa: PENDIENTE | LOCALIZADO | REVISAR | NO_ENCONTRADO | ERROR | VERIFICADO.
  geo_estado: z.enum(['PENDIENTE', 'LOCALIZADO', 'REVISAR', 'NO_ENCONTRADO', 'ERROR', 'VERIFICADO']).optional(),
}).strict();
// «Mi muestra» del auditor: por páginas, con búsqueda y filtros en el servidor. `ligero` omite los bloques de la ficha (para mapa y resumen).
export const miasQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  q: z.string().trim().max(100).optional(),
  tipo: z.enum(['CONSUMO', 'OTROS']).optional(),
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional(),
  ligero: z.enum(['true', 'false']).optional(),
}).strict();
export const disponiblesQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  q: z.string().trim().max(100).optional(),
  tipo: z.enum(['CONSUMO', 'OTROS']).optional(),
  // Ubicación del celular: las apps anteriores todavía la mandan. «Disponibles» ya no depende de dónde esté el auditor, así que se acepta y se ignora.
  lat: z.coerce.number().min(-90).max(90).optional(), lon: z.coerce.number().min(-180).max(180).optional(),
}).strict();
// Puntos de clientes para el mapa del supervisor: por zona y con tope de seguridad (devuelve `truncado` si hay más).
export const mapaQuery = z.object({
  departamento: z.string().trim().max(100).optional(),
  provincia: z.string().trim().max(100).optional(),
  distrito: z.string().trim().max(100).optional(),
  auditor: z.string().uuid().optional(),
  q: z.string().trim().min(2).max(100).optional(),
  visitados_desde: z.string().datetime().optional(), // trae también los casos visitados desde ese momento (el panel manda el inicio de su día)
  limite: z.coerce.number().int().min(1).max(10000).optional(),
}).strict();
export const geocodificarQuery = z.object({ limite: z.coerce.number().int().min(1).max(20).optional() }).strict();
export const importarQuery = z.object({
  simular: z.enum(['true', 'false']).optional(),
  autoasignable: z.enum(['true', 'false']).optional(),
}).strict();
export const importacionesQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).strict();

// Filtros del modulo de evidencias/fichas (panel de Administrador/Supervisor).
// Uno o varios valores separados por comas («CONFORME,OBSERVADO»): llega como lista, sin repetidos y solo con valores permitidos.
const listaPermitida = (valores) => z.string().trim().min(1).max(80)
  .transform((texto) => [...new Set(texto.split(',').map((x) => x.trim()).filter(Boolean))])
  .refine((lista) => lista.length > 0 && lista.every((x) => valores.includes(x)), { message: 'Valor no permitido' });
const diaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => { const d = new Date(`${s}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s; }, { message: 'Fecha no válida' });
// Filtros de la lista de visitas (y de su exportación): los días son del usuario y `desfase` son los minutos que su navegador está detrás de UTC.
const visitasFiltros = {
  estado: z.string().trim().max(30).optional(),
  id_usuario_auditor: z.string().uuid().optional(),
  resultado: listaPermitida(['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO']).optional(),
  tipo_credito: listaPermitida(['CONSUMO', 'OTROS']).optional(),
  con_alertas: z.enum(['true', 'false']).optional(),
  desde: diaIso.optional(),
  hasta: diaIso.optional(),
  desfase: z.coerce.number().int().min(-840).max(840).optional(),
  q: z.string().trim().min(2).max(100).optional(),
};
export const visitasListQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  ...visitasFiltros,
}).strict();
// `formato`: xlsx (Excel con formato, el de siempre del panel) o csv (texto plano, para quien lo procesa con otras herramientas).
export const visitasExportarQuery = z.object({ ...visitasFiltros, formato: z.enum(['xlsx', 'csv']).optional() }).strict();

// --- Expedientes ---
export const expedienteCreateBody = z.object({
  codigo_expediente: cleanString(50),
  tipo_credito: z.enum(['CONSUMO', 'OTROS']),
  oficina: optionalString(100),
  tipo_documento_cliente: z.enum(['DNI', 'CE', 'PASAPORTE', 'RUC']).default('DNI'),
  numero_documento_cliente: cleanString(20),
  nombres_cliente: cleanString(200),
  telefono_cliente: optionalString(20),
  direccion_domicilio: optionalString(255),
  distrito: optionalString(100),
  provincia: optionalString(100),
  departamento: optionalString(100),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
  asesor_responsable: cleanString(150),
  monto_desembolso: z.coerce.number().nonnegative().optional(),
  moneda: optionalString(5),
  autoasignable: z.boolean().optional(),
  datos_cliente: z.record(z.string(), z.unknown()).optional(),
  datos_negocio: z.record(z.string(), z.unknown()).optional(),
  datos_credito: z.record(z.string(), z.unknown()).optional(),
  evaluacion_financiera: z.record(z.string(), z.unknown()).optional(),
  endeudamiento: z.record(z.string(), z.unknown()).optional(),
}).strict();
export const expedienteUpdateBody = expedienteCreateBody.partial().refine(data => Object.keys(data).length > 0, 'Debe enviar al menos un campo');
// Ubicación de un negocio (MYPE) fijada a mano desde el panel.
export const negocioParams = z.object({ id: z.coerce.number().int().positive(), indice: z.coerce.number().int().min(0).max(5) }).strict();
export const negocioUbicacionBody = z.object({ latitud: z.coerce.number().min(-90).max(90), longitud: z.coerce.number().min(-180).max(180) }).strict();

// --- Asignaciones de auditoría ---
export const asignacionCreateBody = z.object({
  id_expediente: z.coerce.number().int().positive(),
  id_usuario_auditor: z.string().uuid(),
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional(),
}).strict();
export const asignacionBulkBody = z.object({
  id_usuario_auditor: z.string().uuid(),
  id_expedientes: z.array(z.coerce.number().int().positive()).min(1).max(500),
  prioridad: z.enum(['ALTA', 'MEDIA', 'BAJA']).optional(),
}).strict();

// --- Visitas (ficha de entrevista) ---
export const cuestionarioSchema = z.object({
  donde_realiza_pagos: optionalString(200),
  conyuge_conoce_prestamo: z.boolean().optional(),
  conyuge_no_aplica: z.boolean().optional(), // Consumo: la ficha del banco ofrece «NO APLICA»
  // Obligatorias solo si el auditor llegó al cliente (CONFORME/OBSERVADO): lo valida el servicio.
  entrego_dinero_asesor: z.boolean().optional(),
  creditos_paralelos: z.boolean().optional(),
  pago_comision_adicional: z.boolean().optional(),
  recibio_monto_total: z.boolean().optional(),
  comparte_dinero_credito: z.boolean().optional(),
  titular_administra_negocio: z.boolean().optional(),
  tiene_microseguro: z.boolean().optional(),
  recibio_info_microseguro: z.boolean().optional(),
  conforme_microseguro: z.boolean().optional(),
  comentario_microseguro: optionalString(500),
}).strict();

export const ubicacionBody = z.object({
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  precision: z.coerce.number().nonnegative().optional(),
  simulada: z.boolean().optional(), // la app avisa si el GPS es simulado (Fake GPS); apps anteriores no lo envían
  bateria: z.coerce.number().int().min(0).max(100).optional(), // % de batería del celular; apps anteriores no lo envían
  cargando: z.boolean().optional(),
}).strict();

// Al iniciar la jornada la app manda la posición del celular en ese momento y, si el celular puede averiguarlo, el distrito, la provincia y el departamento:
// esa es la zona de trabajo. Todo es opcional (las apps anteriores solo mandan la acción).
const nombreDeZona = z.string().trim().max(100).optional();
export const jornadaBody = z.object({
  accion: z.enum(['INICIAR', 'TERMINAR']),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
  precision: z.coerce.number().nonnegative().max(100_000).optional(),
  simulada: z.boolean().optional(), // el celular avisa si el GPS es simulado (Fake GPS)
  distrito: nombreDeZona, provincia: nombreDeZona, departamento: nombreDeZona,
}).strict().refine((d) => (d.latitud === undefined) === (d.longitud === undefined), { message: 'La latitud y la longitud van juntas', path: ['longitud'] });
// Historial de jornadas de un usuario: por páginas, con el cursor de la última que se vio.
export const jornadasQuery = z.object({ limit: z.coerce.number().int().min(1).max(100).optional(), cursor: z.string().max(200).optional() }).strict();

export const autoasignacionBody = z.object({ activa: z.boolean() }).strict();

// --- Seguridad: registro de auditoría ---
// Fechas: AAAA-MM-DD (el día completo en UTC) o una fecha y hora ISO.
const fechaFiltro = z.string().trim().max(40).refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha no válida');
const filtrosAuditoria = {
  q: z.string().trim().max(100).optional(),
  actor: z.string().trim().max(50).optional(),
  ruta: z.string().trim().max(100).optional(), // la versión anterior filtraba por ruta
  categoria: z.enum(Object.keys(CATEGORIAS)).optional(),
  accion: z.string().regex(/^[A-Z_]{3,40}$/).optional(),
  severidad: z.enum(SEVERIDADES).optional(),
  resultado: z.enum(RESULTADOS).optional(),
  solo_cambios: z.enum(['true', 'false']).optional(),
  entidad: z.string().trim().max(50).optional(),
  entidad_id: z.string().trim().max(64).optional(),
  desde: fechaFiltro.optional(),
  hasta: fechaFiltro.optional(),
};
export const auditoriaQuery = z.object({
  ...filtrosAuditoria,
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).max(100000).optional(), // las páginas por número son de la versión anterior: ahora se usa `cursor`
  cursor: z.string().max(200).optional(),
  contar: z.enum(['true', 'false']).optional(),
}).strict();
// La exportación exige un rango de fechas (así nunca es un volcado sin límite) de hasta un año.
export const exportarAuditoriaQuery = z.object({ ...filtrosAuditoria, desde: fechaFiltro, hasta: fechaFiltro }).strict().superRefine((d, ctx) => {
  const dias = (Date.parse(d.hasta) - Date.parse(d.desde)) / 86_400_000;
  if (dias < 0) ctx.addIssue({ code: 'custom', path: ['hasta'], message: 'La fecha final no puede ser anterior a la inicial' });
  else if (dias > 366) ctx.addIssue({ code: 'custom', path: ['hasta'], message: 'El rango máximo para exportar es de un año' });
});
// `fresco=true` se salta la caché de 30 s (el botón «Actualizar» de la pantalla).
// Cuántas anotaciones (las últimas) recalcula la verificación del sello; con 100 000 tarda unos segundos.
export const integridadQuery = z.object({ ultimas: z.coerce.number().int().min(1).max(100000).optional() }).strict();
export const metricasSeguridadQuery = z.object({ ventana: z.enum(['24h', '7d', '30d']).optional(), fresco: z.enum(['true', 'false']).optional() }).strict();
export const alertasSeguridadQuery = z.object({ fresco: z.enum(['true', 'false']).optional() }).strict();

// Tope de casos abiertos por asesor al tomarlos por su cuenta (0 = sin tope).
export const topeCasosBody = z.object({ maximo: z.number().int().min(0).max(1000) }).strict();

// Quitar casos a un asesor (se enfermó, se retiró…): todos los activos o solo los elegidos, y a dónde van — a «Disponibles» o a otro asesor.
export const quitarCasosBody = z.object({
  id_usuario_auditor: z.string().uuid(),
  id_asignaciones: z.array(z.coerce.number().int().positive()).min(1).max(500).optional(),
  motivo: z.enum(MOTIVOS_QUITAR),
  nota: z.string().trim().max(200).optional(),
  destino: z.enum(DESTINOS_QUITAR),
  id_usuario_destino: z.string().uuid().optional(),
}).strict().superRefine((d, ctx) => {
  if (d.destino === 'ASESOR' && !d.id_usuario_destino) ctx.addIssue({ code: 'custom', path: ['id_usuario_destino'], message: 'Elige a qué asesor pasan los casos' });
  if (d.destino === 'DISPONIBLES' && d.id_usuario_destino) ctx.addIssue({ code: 'custom', path: ['id_usuario_destino'], message: 'Con destino «Disponibles» no se elige asesor' });
  if (d.destino === 'ASESOR' && d.id_usuario_destino === d.id_usuario_auditor) ctx.addIssue({ code: 'custom', path: ['id_usuario_destino'], message: 'El asesor que recibe tiene que ser otro' });
});

// --- Modo pruebas: borrar empleados y limpiar datos (solo el administrador, con el modo encendido) ---
export const modoPruebasBody = z.object({ activo: z.boolean() }).strict();
export const limpiezaDatosQuery = z.object({ alcance: z.enum(['campo', 'todo']) }).strict();
// `confirmar` (la palabra BORRAR) y `clave` (la contraseña de quien borra) los revisa el servidor; aquí solo se acota su forma.
export const limpiezaDatosBody = z.object({ alcance: z.enum(['campo', 'todo']), confirmar: z.string().max(40), clave: z.string().min(1).max(128) }).strict();
export const limpiezaUsuarioBody = z.object({ confirmar: z.string().max(60) }).strict();
export const limpiezaEmpleadosBody = z.object({ confirmar: z.string().max(40), clave: z.string().min(1).max(128) }).strict();

// --- Empresas (solo el administrador universal) ---
const reglasEmpresa = z.object({ geocerca_radio_m: z.coerce.number().int().optional(), precision_maxima_m: z.coerce.number().int().optional(), formatos_importacion: z.array(z.enum(['CORE_262', 'SIMPLE'])).min(1).max(10).optional() }).strict();
const marcaEmpresa = z.object({ nombre: z.string().max(80).optional(), producto: z.string().max(80).optional(), color: z.string().max(7).optional(), logo_url: z.string().max(500).optional() }).strict();
export const empresaCreateBody = z.object({
  nombre: cleanString(150), nombre_corto: z.string().trim().max(60).optional(), slug: z.string().trim().max(60).optional(),
  prefijo: z.string().trim().max(8).optional(), configuracion: reglasEmpresa.optional(), marca: marcaEmpresa.optional(),
}).strict();
export const empresaUpdateBody = z.object({
  nombre: cleanString(150).optional(), nombre_corto: z.string().trim().max(60).optional(), estado: z.enum(['ACTIVA', 'SUSPENDIDA']).optional(),
  prefijo: z.string().trim().max(8).optional(), configuracion: reglasEmpresa.optional(), marca: marcaEmpresa.optional(),
}).strict().refine((d) => Object.keys(d).length > 0, 'Debe enviar al menos un campo');

// Gráfico del Resumen: qué serie dibuja (la tarjeta elegida), período (7 días / 8 semanas / 6 meses), último día y desfase horario del navegador.
export const actividadQuery = z.object({
  metrica: z.enum(['expedientes', 'asignaciones', 'visitas', 'observados']).optional(),
  periodo: z.enum(['diario', 'semanal', 'mensual']).optional(),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  desfase: z.coerce.number().int().min(-840).max(840).optional(),
}).strict();

// Tablero del Resumen: las cuatro series, el ranking de auditores y los resultados de UN mismo tramo (7 días, 8 semanas o 6 meses), así coinciden.
export const tableroQuery = z.object({
  periodo: z.enum(['diario', 'semanal', 'mensual']).optional(),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  desfase: z.coerce.number().int().min(-840).max(840).optional(),
}).strict();

export const trackingQuery = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();

export const evidenciaPresignBody = z.object({
  id_expediente: z.coerce.number().int().positive(),
  tipo: z.enum(['FOTO_PRINCIPAL', 'FOTO_ADICIONAL']),
  content_type: z.literal('image/jpeg'),
  size: z.coerce.number().int().positive(),
}).strict();

const bloqueConformidad = z.object({ conforme: z.boolean(), comentario: optionalString(500) }).strict();
export const conformidadFinancieraSchema = z.object({
  ingresos: bloqueConformidad, balance: bloqueConformidad, resultados: bloqueConformidad,
}).strict();

export const visitaCreateBody = z.object({
  client_sync_id: z.string().regex(/^[A-Za-z0-9._:-]{16,100}$/).optional(),
  id_asignacion: z.coerce.number().int().positive().optional(),
  id_expediente: z.coerce.number().int().positive(),
  fecha_hora_checkin: z.iso.datetime(),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  precision_metros: z.coerce.number().nonnegative().max(100000).optional(),
  mock_location: z.boolean().default(false),
  device_integrity_ok: z.boolean().default(true),
  device_id: optionalString(150),
  // A qué dirección fue el auditor: el domicilio de la persona (por defecto) o, en MYPE, uno de los negocios.
  ubicacion_visitada: z.enum(['DOMICILIO', 'NEGOCIO']).optional(),
  indice_negocio: z.coerce.number().int().min(0).max(5).optional(),
  resultado: z.enum(['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO']),
  respuestas_cuestionario: cuestionarioSchema,
  comentario_negocio: optionalString(2000),
  comentario_auditor: optionalString(2000),
  otros_clientes_domicilio: z.array(z.object({
    nombre: optionalString(200), parentesco: optionalString(100),
    actividad: optionalString(150), antiguedad_negocio: optionalString(100),
  }).strict()).max(10).optional(),
  otros_ingresos: z.array(z.object({ origen: optionalString(150), monto_mensual: z.coerce.number().nonnegative().optional() }).strict()).max(3).optional(),
  // Ficha por tipo de crédito (MYPE_V1 / CONSUMO_V1). Las apps anteriores no la envían: el
  // servidor la deduce del expediente y no exige los campos propios de MYPE.
  plantilla: z.enum(['CONSUMO_V1', 'MYPE_V1']).optional(),
  estado_negocio: z.enum(['EN_FUNCIONAMIENTO', 'INOPERATIVO', 'DE_TERCEROS']).optional(),
  propiedad_local: z.enum(['PROPIO', 'ALQUILADO', 'FAMILIAR', 'OTRO']).optional(),
  otros_pasivos: optionalString(500),
  conformidad_financiera: conformidadFinancieraSchema.optional(),
  firmante_documento: z.string().trim().regex(/^[A-Za-z0-9]{6,20}$/).optional(),
  firma_evidencia: z.string().regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/).max(700000).optional(),
  // Firma del auditor de campo al cerrar su trabajo, y versión de la ficha que llenó la app (2 = pide esa firma). Las apps anteriores no las envían.
  firma_auditor: z.string().regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/).max(700000).optional(),
  ficha_version: z.number().int().min(1).max(20).optional(),
  evidencia_principal_key: cleanString(255),
  evidencia_adicional_key: cleanString(255).optional(),
}).strict();

// --- Términos y condiciones: la aceptación lleva la versión leída (si cambió, el servidor la rechaza) ---
export const terminosAceptarBody = z.object({ version: z.string().trim().min(1).max(20) }).strict();
