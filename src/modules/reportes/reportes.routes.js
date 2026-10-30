import { Router } from 'express';
import controller from './reportes.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { idParams, actividadQuery, tableroQuery, efectividadQuery } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware, roleMiddleware(OPERATIONAL_MANAGERS));
router.get('/resumen', controller.resumen);
router.get('/actividad', validate({ query: actividadQuery }), controller.actividad);
router.get('/tablero', validate({ query: tableroQuery }), controller.tablero);
// Efectividad de los auditores de campo en un periodo (mes o rango) y su Excel con el detalle por día y las visitas.
router.get('/efectividad', validate({ query: efectividadQuery }), controller.efectividad);
router.get('/efectividad/excel', validate({ query: efectividadQuery }), controller.efectividadExcel);
router.get('/asignaciones-actividad', validate({ query: actividadQuery }), controller.actividad); // nombre de la primera versión del panel (sin `metrica` cuenta asignaciones)
router.get('/visita/:id/word', validate({ params: idParams }), controller.wordVisita);

export default router;
