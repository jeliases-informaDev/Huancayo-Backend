import { Router } from 'express';
import controller from './limpieza.controller.js';
import { authMiddleware } from '#modules/auth/auth.middleware.js';
import { roleMiddleware } from '#core/middlewares/role.middleware.js';
import { ADMIN_ROLES } from '#core/security/roles.js';
import { validate } from '#core/middlewares/validate.middleware.js';
import { uuidParams, modoPruebasBody, limpiezaDatosQuery, limpiezaDatosBody, limpiezaUsuarioBody, limpiezaEmpleadosBody } from '../../validation/schemas.js';

// Modo pruebas: solo el administrador. Todo lo que borra exige además que la empresa tenga el modo encendido (lo revisa el servicio).
const router = Router();
router.use(authMiddleware, roleMiddleware(ADMIN_ROLES));
router.get('/estado', controller.estado);
router.put('/modo-pruebas', validate({ body: modoPruebasBody }), controller.fijarModoPruebas);
router.get('/datos/vista-previa', validate({ query: limpiezaDatosQuery }), controller.vistaPreviaDatos);
router.post('/datos', validate({ body: limpiezaDatosBody }), controller.limpiarDatos);
router.get('/usuarios/:id/vista-previa', validate({ params: uuidParams }), controller.vistaPreviaUsuario);
router.post('/usuarios/:id', validate({ params: uuidParams, body: limpiezaUsuarioBody }), controller.borrarUsuario);
router.get('/empleados/vista-previa', controller.vistaPreviaEmpleados);
router.post('/empleados', validate({ body: limpiezaEmpleadosBody }), controller.borrarEmpleados);
// Datos de demostración (con el modo pruebas encendido): cuántos hay, cargar 24 visitas de ejemplo y quitar lo marcado como ejemplo.
router.get('/demo', controller.estadoDemo);
router.post('/demo/visitas', controller.cargarDemo);
router.delete('/demo/visitas', controller.quitarDemo);

export default router;
