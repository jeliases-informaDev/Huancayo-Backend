import{Router}from'express';
import controller from './seguridad.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
const router=Router();router.use(authMiddleware,roleMiddleware(OPERATIONAL_MANAGERS));router.get('/auditoria',controller.auditoria);router.get('/metricas',controller.metricas);export default router;