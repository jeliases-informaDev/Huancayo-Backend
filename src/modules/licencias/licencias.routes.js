import { Router } from 'express';
import controller from './licencias.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';

const router = Router();
router.use(authMiddleware);
// Cualquier usuario con sesión ve la licencia de su empresa (solo lectura, sin roles): el aviso de vencimiento lo muestran el panel y la app a todos.
router.get('/', controller.actual);

export default router;
