import { Router } from 'express';
import controller from './empresas.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { ROLES } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { uuidParams, empresaCreateBody, empresaUpdateBody } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

// Cualquier usuario autenticado ve SU empresa (marca y reglas); el catálogo completo, solo el administrador universal.
router.get('/actual', controller.actual);
router.get('/', roleMiddleware([ROLES.UNIVERSAL]), controller.listar);
router.post('/', roleMiddleware([ROLES.UNIVERSAL]), validate({ body: empresaCreateBody }), controller.crear);
router.put('/:id', roleMiddleware([ROLES.UNIVERSAL]), validate({ params: uuidParams, body: empresaUpdateBody }), controller.actualizar);

export default router;
