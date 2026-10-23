-- Mapa de Seguimiento: además de los casos activos trae los visitados desde el inicio del día (asignaciones FINALIZADAS con fecha de fin de hoy).
-- Sin este índice esa consulta recorrería todas las finalizadas de la empresa, que crecen todos los días.
-- CreateIndex
CREATE INDEX `asignaciones_auditoria_empresa_id_estado_fecha_fin_idx` ON `asignaciones_auditoria`(`empresa_id`, `estado`, `fecha_fin`);
