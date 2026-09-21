import 'dotenv/config';
import { z } from 'zod';

const corsOrigins = z.string().superRefine((value, ctx) => {
  const origins = value.split(',').map(origin => origin.trim()).filter(Boolean);
  if (origins.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'Debe declarar al menos un origen permitido' });
    return;
  }
  for (const origin of origins) {
    if (origin === '*' || origin.endsWith('/')) {
      ctx.addIssue({ code: 'custom', message: `Origen CORS no permitido: ${origin}. No use comodines ni / al final` });
      continue;
    }
    try {
      const url = new URL(origin);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) throw new Error();
    } catch {
      ctx.addIssue({ code: 'custom', message: `Origen CORS inválido: ${origin}` });
    }
  }
});

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  // Certificado CA del proveedor MySQL administrado (p. ej. Aiven) para TLS con
  // verificación de identidad del servidor. Vacío en desarrollo local (Docker sin TLS).
  DATABASE_SSL_CA: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  MFA_ENCRYPTION_KEY: z.string().min(32, 'MFA_ENCRYPTION_KEY debe tener al menos 32 caracteres'),
  INITIAL_ADMIN_USERNAME: z.string().trim().min(3).max(50).default('CajaHuancayo'),
  REQUIRE_MFA: z.enum(['true', 'false']).default('false'),
  // Exenciones por cuenta, nunca por rol, para no desactivar MFA a todos los administradores.
  MFA_EXEMPT_USERNAMES: z.string().default(''),
  JWT_EXPIRES_IN: z.string().default('8h'),
  // El auditor de campo no tiene forma de renovar la sesión sin volver a loguearse
  // (no existe token de refresco): si esto fuera corto, la sesión podría vencer a
  // mitad de una visita real (trasladarse, entrevistar, fotos, firma) y el auditor
  // se quedaría bloqueado con la ficha a medio llenar. Se cubre un turno completo;
  // la protección real ante un celular perdido es el vínculo a un solo dispositivo
  // y que el administrador pueda desactivar la cuenta o liberar el dispositivo al
  // instante (invalida la sesión vigente vía token_version), no un vencimiento corto.
  JWT_FIELD_EXPIRES_IN: z.string().default('12h'),
  JWT_ISSUER: z.string().default('caja-huancayo-auditoria-api'),
  JWT_AUDIENCE: z.string().default('caja-huancayo-auditoria-clients'),
  FRONTEND_URL: corsOrigins.default('http://localhost:5173'),
  CORS_ALLOW_ALL: z.enum(['true', 'false']).default('false'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  MAX_LOGIN_FAILURES: z.coerce.number().int().min(3).max(20).default(5),
  // Un dispositivo activo por cuenta de campo. Activo por defecto (incluida
  // producción); solo se apaga explícitamente en entornos de prueba locales donde
  // el mismo usuario se loguea seguido desde dispositivos/navegadores distintos.
  ENFORCE_DEVICE_BINDING: z.enum(['true', 'false']).default('true'),
  ACCOUNT_LOCK_MINUTES: z.coerce.number().int().min(5).max(1440).default(15),
  // Almacenamiento local de evidencias (fase 1 — sin credenciales cloud todavía).
  EVIDENCIAS_DIR: z.string().default('./storage/evidencias'),
  // Render inyecta RENDER_EXTERNAL_URL con la URL pública del propio servicio; se usa
  // como valor por defecto para no tener que configurarlo a mano tras cada deploy.
  EVIDENCIAS_BASE_URL: z.string().default(process.env.RENDER_EXTERNAL_URL || 'http://localhost:4100'),
  // Anti-fraude: radio máximo (metros) entre el domicilio del expediente y el punto de la visita.
  GEOFENCE_RADIO_METROS: z.coerce.number().int().min(10).max(50000).default(300),
  GEOFENCE_PRECISION_MAXIMA_METROS: z.coerce.number().int().min(5).max(5000).default(100),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  const details = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Configuración de entorno inválida: ${details}`);
}
if (result.data.NODE_ENV === 'production' && !process.env.FRONTEND_URL?.trim()) {
  throw new Error('Configuración de entorno inválida: FRONTEND_URL es obligatorio en producción');
}
if (result.data.NODE_ENV === 'production' && result.data.CORS_ALLOW_ALL === 'true') {
  throw new Error('Configuración de entorno inválida: CORS_ALLOW_ALL no puede habilitarse en producción');
}
if (result.data.NODE_ENV === 'production' && result.data.ENFORCE_DEVICE_BINDING === 'false') {
  throw new Error('Configuración de entorno inválida: ENFORCE_DEVICE_BINDING no puede desactivarse en producción');
}

export const env = Object.freeze(result.data);
export const allowedOrigins = Object.freeze(
  env.FRONTEND_URL.split(',').map(value => value.trim()).filter(Boolean)
);
export const mfaExemptUsernames = Object.freeze(
  [...new Set([
    env.INITIAL_ADMIN_USERNAME,
    ...env.MFA_EXEMPT_USERNAMES.split(','),
  ].map(value => value.trim().toLowerCase()).filter(Boolean))]
);
