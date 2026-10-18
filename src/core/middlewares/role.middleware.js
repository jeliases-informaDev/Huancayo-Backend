/**
 * Middleware para validar que el usuario cuente con los roles autorizados.
 * 
 * @param {string[]} allowedRoles - Lista de roles permitidos para acceder a la ruta.
 * @returns {import("express").RequestHandler} Middleware de Express.
 */
export function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado. Middleware auth debe preceder a este guard." });
    }

    // Dentro de una empresa, el administrador universal de Sulotec actúa como administrador de esa empresa.
    // Sin empresa elegida (cabecera x-empresa-id) no puede ver datos de ninguna: se le dice qué falta en vez de un simple «no autorizado».
    if (req.user.rol === "UNIVERSAL" && !req.user.empresa_id && allowedRoles.includes("ADMINISTRADOR")) {
      return res.status(400).json({ error: "Elige la empresa con la que vas a trabajar (cabecera x-empresa-id).", code: "EMPRESA_REQUERIDA" });
    }
    const comoAdministrador = req.user.rol === "UNIVERSAL" && req.user.empresa_id && allowedRoles.includes("ADMINISTRADOR");
    if (!allowedRoles.includes(req.user.rol) && !comoAdministrador) {
      return res.status(403).json({ error: "No autorizado. Permisos insuficientes." });
    }

    next();
  };
}
