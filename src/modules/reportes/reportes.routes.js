import { Router } from 'express';
import controller from './reportes.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { idParams } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware, roleMiddleware(OPERATIONAL_MANAGERS));
router.get('/visita/:id/word', validate({ params: idParams }), controller.wordVisita);

export default router;
