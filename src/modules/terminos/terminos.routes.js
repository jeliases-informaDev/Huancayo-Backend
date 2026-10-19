import { Router } from 'express';
import controller from './terminos.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { terminosAceptarBody } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

// Cualquier usuario autenticado lee los términos vigentes de su empresa (y si ya los aceptó) y registra su aceptación.
router.get('/', controller.obtener);
router.post('/aceptar', validate({ body: terminosAceptarBody }), controller.aceptar);

export default router;
