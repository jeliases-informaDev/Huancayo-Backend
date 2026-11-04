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

## Licencias de Sulotec

GeoMatrix se licencia **solo por usuarios** y no decide reglas: pregunta al servicio común de licencias de Sulotec
(`Licencias-Backend`) y muestra lo que responde. Variables: `LICENCIAS_URL` (en la VM `http://licencias:3200`),
`LICENCIAS_TOKEN` (`geomatrix.<secreto>`; **vacío = licencias apagadas**: todo sigue como hoy) y `LICENCIAS_PRODUCTO`
(`geomatrix`). Código en `src/modules/licencias/`.

- La licencia de cada empresa se guarda 5 minutos en memoria. Si Sulotec no responde se sigue con la última conocida y, si nunca
  se conoció, se trata como activa: una caída de Sulotec nunca bloquea a un cliente. Un 401 es un token mal configurado (ERROR en el log).
- Nunca se bloquean: las lecturas, el administrador universal, `/api/auth`, `/api/terminos`, `/api/empresas`, `/api/licencia`,
  la posición del celular, trazar rutas, terminar la jornada y apagar el modo pruebas.
- `SOLO_LECTURA` (vencida): 403 `LICENCIA_SOLO_LECTURA` en las escrituras de trabajo. Sí se puede editar, desactivar, eliminar y
  reiniciar MFA o celular de usuarios y cerrar autoasignación y tope de casos; no crear ni reactivar usuarios.
- `SUSPENDIDA` / `CANCELADA`: 403 `LICENCIA_SUSPENDIDA` / `LICENCIA_CANCELADA` en toda escritura salvo desactivar o eliminar usuarios.
- `SIN_LICENCIA` (404 de Sulotec) o licencia desconocida: no se bloquea nada ni se exige cupo (WARN en el log).
- Cupo: antes de crear un usuario ACTIVO o reactivar uno se consulta en vivo; sin cupo → 409 `LICENCIA_SIN_CUPO` con `activos`,
  `usuarios_max` y `enlace` (`https://sulotec.com/mi-licencia`, o `https://sulotec.com/licencias` si quien crea es el universal).
  Después de crear, activar, desactivar o eliminar, y una vez al arrancar, se reporta a Sulotec el total de usuarios activos.
- `GET /api/licencia` (cualquier sesión; `?refrescar=1` vuelve a preguntar) devuelve `{ estado, plan, usuarios_max, usuarios_activos,
  puede_crear_usuarios, vencimiento, dias_para_vencer, mensaje, enlace }` o `null` si está apagado. El mismo objeto viaja como
  `licencia` en `/api/auth/me`, `/api/empresas/actual` (dentro de `data`), `/api/visitas/config` (dentro de `data`) y en la raíz de
  `/api/asignaciones/mias` y `/api/asignaciones/mias/version` (la app los pide cada 20 s; sale de la caché, no agrega tráfico a Sulotec).
- Un 403 del guard queda en el registro de seguridad como `LICENCIA_BLOQUEO` (AVISO), aparte de `ACCESO_DENEGADO`. El trabajador de
  geocodificación salta las empresas cuya licencia conocida no sea `ACTIVA` ni `SIN_LICENCIA` (no escribe expedientes ni gasta proveedor).
- Probar en local: levantar `Licencias-Backend` en `http://localhost:3200`, crear la licencia de prueba con su
  `scripts/licencia-prueba.js` (con el `id_empresa` de GeoMatrix) y poner `LICENCIAS_URL=http://localhost:3200` y el token de prueba en `.env`.

## Pendiente / fuera de alcance de esta fase

Ver la sección "Fuera de alcance" del plan original. En resumen: sin integración
en vivo con el sistema core de Caja Huancayo (import por Excel), sin SSO/AD,
sin SIEM, sin pentest formal, sin panel web (todo vía API o la app móvil).
