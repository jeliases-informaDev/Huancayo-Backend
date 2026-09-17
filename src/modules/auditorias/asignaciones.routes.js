import { Router } from 'express';
import controller from './asignaciones.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { idParams, listQuery, asignacionCreateBody, asignacionBulkBody } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

router.get('/mias', controller.misAsignaciones);

router.use(roleMiddleware(OPERATIONAL_MANAGERS));
router.get('/', validate({ query: listQuery }), controller.listar);
router.post('/', validate({ body: asignacionCreateBody }), controller.crear);
router.post('/masivo', validate({ body: asignacionBulkBody }), controller.crearMasivo);
router.post('/:id/cancelar', validate({ params: idParams }), controller.cancelar);

export default router;
