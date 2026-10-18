// Aislamiento por empresa en UNA sola capa: cada consulta de Prisma a un modelo con datos de empresa recibe el filtro `empresa_id` del
// contexto de la petición (lecturas, conteos, cambios y borrados) y cada registro nuevo se crea con esa empresa. Si no hay contexto, la
// consulta falla con un error claro en vez de devolver datos de todas las empresas. Un UUID de empresa no es seguridad por sí solo: el
// aislamiento lo garantiza este filtro en el servidor.
import { contextoEmpresa } from './contexto.js';

// Modelos cuyas filas pertenecen a una empresa. Empresa (el catálogo) queda fuera.
export const MODELOS_EMPRESA = Object.freeze(new Set([
  'Usuario', 'TrackingUbicacion', 'EventoCampo', 'ConfiguracionSistema', 'DispositivoAutorizado', 'Expediente', 'ExpedienteCambio',
  'AsignacionAuditoria', 'VisitaAuditoria', 'Evidencia', 'AuditoriaSeguridad', 'ImportacionMasiva',
]));

const CON_FILTRO = new Set(['findFirst', 'findFirstOrThrow', 'findMany', 'updateMany', 'updateManyAndReturn', 'deleteMany', 'aggregate', 'count', 'groupBy']);
const POR_CLAVE = new Set(['findUnique', 'findUniqueOrThrow', 'update', 'delete']);

// Devuelve los argumentos de la operación con la empresa aplicada (función pura, probada sola).
export function aplicarEmpresa(operation, args, empresaId) {
  const a = { ...(args || {}) };
  const filtro = { empresa_id: empresaId };
  if (CON_FILTRO.has(operation)) { a.where = a.where ? { AND: [filtro, a.where] } : filtro; return a; }
  if (POR_CLAVE.has(operation)) { a.where = { ...(a.where || {}), empresa_id: empresaId }; return a; }
  if (operation === 'create') { a.data = { ...(a.data || {}), empresa_id: empresaId }; return a; }
  if (operation === 'createMany' || operation === 'createManyAndReturn') {
    const d = a.data;
    a.data = Array.isArray(d) ? d.map((fila) => ({ ...fila, empresa_id: empresaId })) : { ...(d || {}), empresa_id: empresaId };
    return a;
  }
  if (operation === 'upsert') {
    a.where = { ...(a.where || {}), empresa_id: empresaId };
    a.create = { ...(a.create || {}), empresa_id: empresaId };
    return a;
  }
  // Operación no prevista: se filtra igual si lleva where; si no, se rechaza para no abrir una puerta sin querer.
  if (a.where !== undefined) { a.where = { AND: [filtro, a.where] }; return a; }
  throw Object.assign(new Error(`Operación ${operation} no admitida sobre datos de empresa`), { statusCode: 500, code: 'OPERACION_NO_AISLADA' });
}

export function errorSinEmpresa() {
  return Object.assign(new Error('Elige la empresa con la que vas a trabajar (cabecera x-empresa-id).'), { statusCode: 400, code: 'EMPRESA_REQUERIDA' });
}

// Extensión que se instala en el cliente de Prisma.
export function extensionEmpresa() {
  return {
    name: 'empresa',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!MODELOS_EMPRESA.has(model)) return query(args);
          const ctx = contextoEmpresa();
          if (ctx?.global) return query(args);
          if (!ctx?.empresaId) throw errorSinEmpresa();
          return query(aplicarEmpresa(operation, args, ctx.empresaId));
        },
      },
    },
  };
}
