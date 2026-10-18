// Contexto de empresa (tenant) de cada petición. Se fija UNA vez, en el middleware de autenticación, a partir del usuario verificado en
// la base (nunca de lo que mande la app o la web), y viaja por todas las llamadas asíncronas de esa petición. El cliente de Prisma lo
// lee para filtrar y marcar cada consulta (ver empresa.prisma.js): sin contexto, una consulta a datos de empresa falla, no devuelve todo.
import { AsyncLocalStorage } from 'node:async_hooks';

const almacen = new AsyncLocalStorage();

// Las consultas de Prisma son perezosas: la operación (y con ella el filtro) corre recién al hacer `await`. Por eso fn se espera AQUÍ,
// dentro del contexto; si solo se devolviera su promesa, el filtro se evaluaría ya fuera y fallaría.
const dentro = (store, fn) => almacen.run(store, async () => await fn());

// Ejecuta fn con la empresa dada como contexto.
export const conEmpresa = (empresaId, fn) => dentro({ empresaId: empresaId || null, global: false }, fn);

// Ámbito de plataforma: SIN filtro por empresa. Solo para operaciones de identidad (buscar al usuario que inicia sesión), mantenimiento
// (depurar puntos GPS antiguos) o administración de empresas. Cada uso debe poder justificarse: nunca para servir datos a un cliente.
export const sinEmpresa = (fn) => dentro({ empresaId: null, global: true }, fn);

export const contextoEmpresa = () => almacen.getStore() || null;
export const empresaActual = () => almacen.getStore()?.empresaId ?? null;
