import { Router } from 'express';
import express from 'express';
import controller from './visitas.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { FIELD_ROLES, OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { idParams, evidenciaParams, visitasListQuery, evidenciaPresignBody, visitaCreateBody, ubicacionBody } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

// Backoffice (revisión) — se declaran antes de los prefijos de campo para que
// no queden atrapadas por el roleMiddleware(FIELD_ROLES) de '/evidencias'.
router.get('/evidencias/:idEvidencia/archivo', roleMiddleware(OPERATIONAL_MANAGERS), validate({ params: evidenciaParams }), controller.archivoEvidencia);
router.get('/', roleMiddleware(OPERATIONAL_MANAGERS), validate({ query: visitasListQuery }), controller.listar);
router.get('/:id', roleMiddleware(OPERATIONAL_MANAGERS), validate({ params: idParams }), controller.obtener);

// Campo (Auditor / Supervisor en campo)
router.post('/evidencias/presign', roleMiddleware(FIELD_ROLES), validate({ body: evidenciaPresignBody }), controller.presignEvidencia);
router.put('/evidencias/upload/:key', roleMiddleware(FIELD_ROLES), express.raw({ type: 'image/jpeg', limit: '5mb' }), controller.subirEvidencia);
router.post('/', roleMiddleware(FIELD_ROLES), validate({ body: visitaCreateBody }), controller.crear);
router.patch('/ubicacion', roleMiddleware(FIELD_ROLES), validate({ body: ubicacionBody }), controller.ubicacion);

export default router;
