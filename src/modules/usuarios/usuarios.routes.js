import { Router } from "express";
import usuariosController from "./usuarios.controller.js";
import { authMiddleware } from "#modules/auth/auth.middleware.js";
import { roleMiddleware } from "#core/middlewares/role.middleware.js";
import { ADMIN_ROLES, OPERATIONAL_MANAGERS } from "#core/security/roles.js";
import { validate } from "#core/middlewares/validate.middleware.js";
import { userCreateBody, userUpdateBody, uuidParams, trackingQuery } from "../../validation/schemas.js";

const router = Router();

router.use(authMiddleware);

// Seguimiento en vivo: visible para Administrador y Supervisor (Auditor de Agencia).
router.get("/ubicaciones", roleMiddleware(OPERATIONAL_MANAGERS), usuariosController.ubicacionesActivas);
router.get("/:id/tracking", roleMiddleware(OPERATIONAL_MANAGERS), validate({ params: uuidParams, query: trackingQuery }), usuariosController.tracking);
// Lista minima de auditores de campo activos (para el selector de "Asignar a" y los
// filtros de Visitas). No expone estado de cuenta, MFA ni el resto de campos de
// gestion de usuarios, que siguen siendo exclusivos del Administrador.
router.get("/auditores", roleMiddleware(OPERATIONAL_MANAGERS), usuariosController.listarAuditores);

router.use(roleMiddleware(ADMIN_ROLES));
router.get("/", usuariosController.listar);
router.post("/", validate({ body: userCreateBody }), usuariosController.crear);
router.put("/:id", validate({ params: uuidParams, body: userUpdateBody }), usuariosController.actualizar);
router.patch("/:id", validate({ params: uuidParams, body: userUpdateBody }), usuariosController.actualizar);
router.post("/:id/mfa/reset", validate({ params: uuidParams }), usuariosController.resetMfa);
router.post("/:id/device/reset", validate({ params: uuidParams }), usuariosController.resetDevice);
router.delete("/:id", validate({ params: uuidParams }), usuariosController.eliminar);

export default router;
