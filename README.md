# GeoMatrix — auditoría de visitas en campo (Backend)

El producto se llama siempre **GeoMatrix**; las pantallas lo muestran como «GeoMatrix · nombre de la empresa que lo contrata».

API para el proyecto de auditoría de visitas en campo (nació para Caja Huancayo y hoy es una plantilla multiempresa). Proyecto
nuevo e independiente de `Afacop-Backend`, construido reusando sus mismos
patrones (Express + Prisma + JWT/MFA + auditoría de seguridad).

## Stack

Node 24 (ESM) · Express 5 · Prisma 7 (MySQL, driver `@prisma/adapter-mariadb`) ·
zod · JWT + TOTP (MFA) · Socket.IO (ubicación en vivo) · `docx` (export Word) ·
evidencias en disco local (fase 1, ver `src/modules/sistema/storage.service.js`).

## Primeros pasos (desarrollo local)

```bash
docker compose up -d          # levanta MySQL local (puerto 3306)
npm install
npx prisma migrate dev        # crea las tablas
node scripts/bootstrap-admin.js   # crea el administrador inicial (usa .env)
node scripts/seed-test-data.js    # crea usuarios y expedientes de prueba
npm run dev                   # http://localhost:4100
```

Variables de entorno: copiar `.env.example` a `.env` y completar `JWT_SECRET`,
`MFA_ENCRYPTION_KEY` (32+ caracteres cada uno) e `INITIAL_ADMIN_PASSWORD`.

## Producción (Sulotec, servidor de Oracle)

La API corre como contenedor (`Dockerfile`, imagen `linux/arm64` o x64) en la VM de Sulotec, detrás de Cloudflare:
`https://api-auditoria.sulotec.com`. El kit de despliegue (compose, `preparar.sh`, `migrar-datos.sh`, `desplegar.sh`,
`probar.sh`) vive en `Sulotec/Sulotec-infra` → `apps/auditoria/`; la configuración y los secretos solo en
`/opt/sulotec/auditoria.env` del servidor. Las fotos van a un bucket compatible con S3 (`EVIDENCIAS_BACKEND=s3`);
`node scripts/probar-almacenamiento.js` comprueba el bucket de punta a punta. La demo anterior en Render y Aiven quedo retirada;
ya no hay archivos de despliegue para ella.

## Usuarios de prueba (creados por `seed-test-data.js`)

Solo para desarrollo local. **La clave no está en el repositorio**: el script usa la variable `TEST_PASSWORD` o genera una al azar y la muestra una sola vez al terminar.
Nunca corras este script contra una base con datos reales y, si alguna vez lo corriste, desactiva o cambia la clave de estos usuarios.

| Usuario | Rol |
|---|---|
| `supervisor.agencia` | SUPERVISOR (usa el panel) |
| `auditor.ramos` / `auditor.cuba` / `auditor.huaman` | AUDITOR (app móvil) |

El administrador inicial se crea con `INITIAL_ADMIN_USERNAME`/`INITIAL_ADMIN_PASSWORD`
del `.env` (por defecto `cajahuancayo` / lo que se defina).

## Dominio

- `Expediente`: ficha de crédito/cliente a auditar (importable por Excel vía
  `POST /api/expedientes/importar`).
- `AsignacionAuditoria`: qué auditor tiene qué expediente en su muestra.
- `VisitaAuditoria`: la ficha de entrevista completada en campo, con las señales
  antifraude (`mock_location`, `device_integrity_ok`, `distancia_domicilio_m`).
- `Evidencia`: fotos con hash SHA-256 (bloquea reuso entre visitas).
- `DispositivoAutorizado`: vincula cada cuenta de campo a un único dispositivo activo.
- `AuditoriaSeguridad`: log inmutable de toda operación mutante (actor, IP, ruta, resultado).

## Seguridad antifraude (ver `visitas.service.js`)

- **Rechazo duro**: `mock_location: true` (Fake GPS) o `device_integrity_ok: false`
  (emulador/dispositivo comprometido) → la visita no se guarda.
- **Señal blanda** (geocerca excedida, precisión GPS insuficiente, fecha futura):
  la visita no puede marcarse CONFORME; se exige resultado OBSERVADO + comentario
  del auditor explicando el motivo.
- Fotos: solo se aceptan las claves presignadas para ese auditor/expediente
  (firma HMAC), y el hash de cada foto debe ser único (no reusable entre visitas).

## Panel web de administración

Repo separado: `C:\CajaHuancayo-Web` (React + Vite). Solo para el rol
`ADMINISTRADOR` (los roles de campo SUPERVISOR/AUDITOR siguen siendo
exclusivos de la app móvil). Permite: importar/crear expedientes, armar la
muestra (asignaciones), revisar cada visita con sus fotos y firma, descargar
la ficha en Word, gestionar usuarios (reset MFA / liberar dispositivo) y ver
el log de auditoría. `npm run dev` (puerto 5173).

## Pendiente / fuera de alcance de esta fase

Ver la sección "Fuera de alcance" del plan original. En resumen: sin integración
en vivo con el sistema core de Caja Huancayo (import por Excel), sin SSO/AD,
sin SIEM, sin pentest formal, sin panel web (todo vía API o la app móvil).
