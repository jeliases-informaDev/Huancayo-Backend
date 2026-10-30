import { Router } from 'express';
import controller from './rutas.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { rutaTrazarBody } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);
// Cualquier usuario con sesión (el auditor en la app, el supervisor en el panel) puede pedir una ruta por calles: solo viajan coordenadas.
router.get('/estado', controller.estado);
router.post('/trazar', validate({ body: rutaTrazarBody }), controller.trazar);

export default router;
