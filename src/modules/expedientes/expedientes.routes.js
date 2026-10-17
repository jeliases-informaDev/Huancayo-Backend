import { Router } from 'express';
import controller from './expedientes.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { OPERATIONAL_MANAGERS } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import upload from '#core/middlewares/upload.middleware.js';
import { idParams, uuidParams, listQuery, importacionesQuery, importarQuery, expedienteCreateBody, expedienteUpdateBody, negocioParams, negocioUbicacionBody, geocodificarQuery } from '../../validation/schemas.js';

const router = Router();
router.use(authMiddleware);

// Mínimo privilegio: el catálogo completo de expedientes (datos de clientes de todas
// las zonas) es solo del backoffice. El auditor de campo recibe únicamente lo suyo por
// /api/asignaciones/mias (asignados) y /api/asignaciones/disponibles (su zona).
router.use(roleMiddleware(OPERATIONAL_MANAGERS));
router.get('/', validate({ query: listQuery }), controller.listar);
// Historial de importaciones (trazabilidad del dato). Va antes de '/:id'.
router.get('/importaciones', validate({ query: importacionesQuery }), controller.listarImportaciones);
router.get('/importaciones/:id', validate({ params: uuidParams }), controller.obtenerImportacion);
router.post('/importaciones/:id/liberar', validate({ params: uuidParams }), controller.liberarImportacion);
// Dirección y mapa: calidad de las direcciones, cola de geocodificación y aceptación de la ubicación sugerida. Antes de '/:id'.
router.get('/geocodificacion/resumen', controller.geoResumen);
router.post('/geocodificacion/procesar', validate({ query: geocodificarQuery }), controller.geoProcesar);
router.post('/geocodificacion/reencolar', controller.geoReencolar);
router.post('/:id/geocodificar', validate({ params: idParams }), controller.geoUno);
router.post('/:id/aceptar-ubicacion', validate({ params: idParams }), controller.aceptarUbicacionSugerida);
router.get('/:id', validate({ params: idParams }), controller.obtener);
router.post('/', validate({ body: expedienteCreateBody }), controller.crear);
router.put('/:id', validate({ params: idParams, body: expedienteUpdateBody }), controller.actualizar);
router.put('/:id/negocios/:indice/ubicacion', validate({ params: negocioParams, body: negocioUbicacionBody }), controller.fijarUbicacionNegocio);
router.delete('/:id', validate({ params: idParams }), controller.eliminar);
router.post('/importar', upload.single('archivo'), validate({ query: importarQuery }), controller.importar);

export default router;
