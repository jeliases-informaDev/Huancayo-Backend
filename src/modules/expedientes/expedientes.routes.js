import { Router } from 'express';
import controller from './expedientes.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import upload from '#core/middlewares/upload.middleware.js';
import { idParams, listQuery, expedienteCreateBody, expedienteUpdateBody } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

router.get('/', validate({ query: listQuery }), controller.listar);
router.get('/:id', validate({ params: idParams }), controller.obtener);

router.use(roleMiddleware(OPERATIONAL_MANAGERS));
router.post('/', validate({ body: expedienteCreateBody }), controller.crear);
router.put('/:id', validate({ params: idParams, body: expedienteUpdateBody }), controller.actualizar);
router.delete('/:id', validate({ params: idParams }), controller.eliminar);
router.post('/importar', upload.single('archivo'), controller.importar);

export default router;
