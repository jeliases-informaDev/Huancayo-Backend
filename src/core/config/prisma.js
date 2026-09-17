import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from './env.js';

// Con la corrección del schema, esta ruta ahora sí encontrará el archivo físico
import { PrismaClient } from '../../generated/prisma/index.js';

// Se parsea DATABASE_URL a un objeto de configuración (en vez de pasar el string
// directo) porque el parser de connection-string de `mariadb` exige el esquema
// "mariadb://" y no admite bien "mysql://" con query params. Además, MySQL 8 usa
// por defecto el plugin de autenticación caching_sha2_password, que en una
// conexión sin TLS necesita recuperar la llave pública RSA del servidor; sin
// allowPublicKeyRetrieval la conexión se queda colgada en el primer intento.
// En producción (Aiven u otro MySQL administrado), DATABASE_SSL_CA trae el certificado
// CA para TLS con verificación de identidad del servidor (rejectUnauthorized: true).
// Sin ese certificado (desarrollo local con Docker) no se fuerza TLS.
function buildSsl() {
  if (!env.DATABASE_SSL_CA) return undefined;
  const ca = env.DATABASE_SSL_CA.includes('\\n') ? env.DATABASE_SSL_CA.replace(/\\n/g, '\n') : env.DATABASE_SSL_CA;
  return { ca, rejectUnauthorized: true };
}

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    allowPublicKeyRetrieval: true,
    ssl: buildSsl(),
  };
}

const adapter = new PrismaMariaDb(parseDatabaseUrl(env.DATABASE_URL));
const prisma = new PrismaClient({ adapter });

export default prisma;
