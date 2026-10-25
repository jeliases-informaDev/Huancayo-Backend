import { Router } from 'express';
import controller from './seguridad.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { ADMIN_ROLES } from '#core/security/roles.js';
import { alertasSeguridadQuery, auditoriaQuery, exportarAuditoriaQuery, integridadQuery, metricasSeguridadQuery } from '../../validation/schemas.js';

// El registro de seguridad (quién hizo qué, desde dónde y con qué cambios) es solo para el administrador de la empresa.
const router = Router();
router.use(authMiddleware, roleMiddleware(ADMIN_ROLES));
router.get('/auditoria', validate({ query: auditoriaQuery }), controller.auditoria);
router.get('/metricas', validate({ query: metricasSeguridadQuery }), controller.metricas);
router.get('/alertas', validate({ query: alertasSeguridadQuery }), controller.alertas);
router.get('/exportar', validate({ query: exportarAuditoriaQuery }), controller.exportar);
// Sello de integridad: recalcula la cadena de huellas de las últimas anotaciones y dice si está intacta.
router.get('/integridad', validate({ query: integridadQuery }), controller.integridad);

export default router;
