import { Router } from "express";
import usuariosController from "./usuarios.controller.js";
import { authMiddleware } from "#modules/auth/auth.middleware.js";
import { roleMiddleware } from "#core/middlewares/role.middleware.js";
import { ADMIN_ROLES } from "#core/security/roles.js";
import { validate } from "#core/middlewares/validate.middleware.js";
import { userCreateBody, userUpdateBody, uuidParams } from "../../validation/schemas.js";

const router = Router();

router.use(authMiddleware, roleMiddleware(ADMIN_ROLES));
router.get("/", usuariosController.listar);
router.post("/", validate({ body: userCreateBody }), usuariosController.crear);
router.put("/:id", validate({ params: uuidParams, body: userUpdateBody }), usuariosController.actualizar);
router.patch("/:id", validate({ params: uuidParams, body: userUpdateBody }), usuariosController.actualizar);
router.post("/:id/mfa/reset", validate({ params: uuidParams }), usuariosController.resetMfa);
router.post("/:id/device/reset", validate({ params: uuidParams }), usuariosController.resetDevice);
router.delete("/:id", validate({ params: uuidParams }), usuariosController.eliminar);

export default router;
