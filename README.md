# Caja Huancayo — Auditoría de Visitas (Backend)

API para el proyecto de auditoría de visitas en campo de Caja Huancayo. Proyecto
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

## Usuarios de prueba (creados por `seed-test-data.js`)

Contraseña para todos: `CajaHuancayo2026!`

| Usuario | Rol |
|---|---|
| `supervisor.test` | SUPERVISOR (usa la app móvil) |
| `auditor1.test` / `auditor2.test` / `auditor3.test` | AUDITOR (app móvil) |

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
