import { Router } from 'express';
import controller from './asignaciones.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS, ADMIN_ROLES, ROLES } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { idParams, listQuery, asignacionCreateBody, asignacionBulkBody, autoasignacionBody, miasQuery, disponiblesQuery, mapaQuery } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

router.get('/mias/version', controller.versionMia);
router.get('/mias', validate({ query: miasQuery }), controller.misAsignaciones);
router.get('/disponibles', roleMiddleware([ROLES.AUDITOR]), validate({ query: disponiblesQuery }), controller.disponibles);
router.post('/auto/:id', roleMiddleware([ROLES.AUDITOR]), validate({ params: idParams }), controller.autoAsignar);

router.use(roleMiddleware(OPERATIONAL_MANAGERS));
router.get('/', validate({ query: listQuery }), controller.listar);
router.get('/resumen-origen', controller.resumenOrigen);
router.get('/carga', controller.carga);
router.get('/mapa', validate({ query: mapaQuery }), controller.mapa);
router.put('/autoasignacion', roleMiddleware(ADMIN_ROLES), validate({ body: autoasignacionBody }), controller.fijarAutoasignacion);
router.post('/', validate({ body: asignacionCreateBody }), controller.crear);
router.post('/masivo', validate({ body: asignacionBulkBody }), controller.crearMasivo);
router.post('/:id/cancelar', validate({ params: idParams }), controller.cancelar);

export default router;
