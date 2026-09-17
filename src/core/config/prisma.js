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
function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    allowPublicKeyRetrieval: true,
  };
}

const adapter = new PrismaMariaDb(parseDatabaseUrl(env.DATABASE_URL));
const prisma = new PrismaClient({ adapter });

export default prisma;
