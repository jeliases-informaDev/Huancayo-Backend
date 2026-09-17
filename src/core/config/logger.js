import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'caja-huancayo-auditoria-backend', environment: env.NODE_ENV },
  redact: {
    paths: [
      'req.headers.authorization', 'req.headers.cookie', 'headers.authorization',
      'password', '*.password', 'token', '*.token', 'JWT_SECRET', 'DATABASE_URL'
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
