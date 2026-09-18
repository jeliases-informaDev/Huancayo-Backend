export const ROLES = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR', SUPERVISOR: 'SUPERVISOR', AUDITOR: 'AUDITOR',
});

const aliases = Object.freeze({ ADMIN: ROLES.ADMINISTRADOR });
export const normalizeRole = role => aliases[role] || role;
export const ALL_ROLES = Object.freeze(Object.values(ROLES));
export const ADMIN_ROLES = Object.freeze([ROLES.ADMINISTRADOR]);
// Único rol que sale a la calle y usa la app móvil (hace la entrevista al cliente).
// El Auditor de Oficina (SUPERVISOR) nunca sale a campo: opera 100% desde la web,
// igual que el Administrador.
export const FIELD_ROLES = Object.freeze([ROLES.AUDITOR]);
// Roles que pueden operar el backoffice (asignar muestras, importar expedientes, gestionar usuarios).
export const OPERATIONAL_MANAGERS = Object.freeze([ROLES.ADMINISTRADOR, ROLES.SUPERVISOR]);
