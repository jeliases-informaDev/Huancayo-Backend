import { z } from 'zod';

const cleanString = max => z.string().trim().min(1).max(max);
const optionalString = max => z.string().trim().max(max).optional();

export const idParams = z.object({ id: z.coerce.number().int().positive() }).strict();
export const uuidParams = z.object({ id: z.string().uuid() }).strict();
export const evidenciaParams = z.object({ idEvidencia: z.string().uuid() }).strict();

// --- Auth ---
export const loginBody = z.object({ username: cleanString(50), password: z.string().min(1).max(128) }).strict();
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
}).strict();
// Puntos de clientes para el mapa del supervisor: por zona y con tope de seguridad (devuelve `truncado` si hay más).
export const mapaQuery = z.object({
  departamento: z.string().trim().max(100).optional(),
  provincia: z.string().trim().max(100).optional(),
  distrito: z.string().trim().max(100).optional(),
  auditor: z.string().uuid().optional(),
  q: z.string().trim().min(2).max(100).optional(),
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
export const visitasListQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  estado: z.string().trim().max(30).optional(),
  id_usuario_auditor: z.string().uuid().optional(),
  resultado: z.enum(['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO']).optional(),
  tipo_credito: z.enum(['CONSUMO', 'OTROS']).optional(),
  con_alertas: z.enum(['true', 'false']).optional(),
}).strict();

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

export const jornadaBody = z.object({ accion: z.enum(['INICIAR', 'TERMINAR']) }).strict();

export const autoasignacionBody = z.object({ activa: z.boolean() }).strict();

// --- Empresas (solo el administrador universal) ---
const reglasEmpresa = z.object({ geocerca_radio_m: z.coerce.number().int().optional(), precision_maxima_m: z.coerce.number().int().optional() }).strict();
const marcaEmpresa = z.object({ nombre: z.string().max(80).optional(), producto: z.string().max(80).optional(), color: z.string().max(7).optional(), logo_url: z.string().max(500).optional() }).strict();
export const empresaCreateBody = z.object({
  nombre: cleanString(150), nombre_corto: z.string().trim().max(60).optional(), slug: z.string().trim().max(60).optional(),
  configuracion: reglasEmpresa.optional(), marca: marcaEmpresa.optional(),
}).strict();
export const empresaUpdateBody = z.object({
  nombre: cleanString(150).optional(), nombre_corto: z.string().trim().max(60).optional(), estado: z.enum(['ACTIVA', 'SUSPENDIDA']).optional(),
  configuracion: reglasEmpresa.optional(), marca: marcaEmpresa.optional(),
}).strict().refine((d) => Object.keys(d).length > 0, 'Debe enviar al menos un campo');

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
  evidencia_principal_key: cleanString(255),
  evidencia_adicional_key: cleanString(255).optional(),
}).strict();
