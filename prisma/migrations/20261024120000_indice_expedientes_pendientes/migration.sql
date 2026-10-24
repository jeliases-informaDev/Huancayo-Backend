-- Asignaciones: la columna «Expedientes sin asignar» se pide por páginas, del más antiguo al más nuevo dentro de un estado.
-- Sin este índice cada página ordenaba todos los pendientes de la empresa, que pueden ser cientos de miles.
-- CreateIndex
CREATE INDEX `expedientes_empresa_id_estado_fecha_creacion_idx` ON `expedientes`(`empresa_id`, `estado`, `fecha_creacion`);
