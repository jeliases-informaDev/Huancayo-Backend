export const ROLES = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR', SUPERVISOR: 'SUPERVISOR', AUDITOR: 'AUDITOR',
});

const aliases = Object.freeze({ ADMIN: ROLES.ADMINISTRADOR });
export const normalizeRole = role => aliases[role] || role;
export const ALL_ROLES = Object.freeze(Object.values(ROLES));
export const ADMIN_ROLES = Object.freeze([ROLES.ADMINISTRADOR]);
// Roles que salen a campo con la app móvil (auditan y, si corresponde, también visitan).
export const FIELD_ROLES = Object.freeze([ROLES.SUPERVISOR, ROLES.AUDITOR]);
// Roles que pueden operar el backoffice (asignar muestras, importar expedientes, gestionar usuarios).
export const OPERATIONAL_MANAGERS = Object.freeze([ROLES.ADMINISTRADOR, ROLES.SUPERVISOR]);
