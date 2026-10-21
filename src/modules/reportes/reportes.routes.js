import { Router } from 'express';
import controller from './reportes.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { idParams, actividadQuery } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware, roleMiddleware(OPERATIONAL_MANAGERS));
router.get('/resumen', controller.resumen);
router.get('/actividad', validate({ query: actividadQuery }), controller.actividad);
router.get('/asignaciones-actividad', validate({ query: actividadQuery }), controller.actividad); // nombre de la primera versión del panel (sin `metrica` cuenta asignaciones)
router.get('/visita/:id/word', validate({ params: idParams }), controller.wordVisita);

export default router;
