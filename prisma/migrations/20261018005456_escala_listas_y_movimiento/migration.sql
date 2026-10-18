-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `mov_desde` DATETIME(3) NULL,
    ADD COLUMN `mov_estado` VARCHAR(15) NULL,
    ADD COLUMN `mov_modo` VARCHAR(12) NULL,
    ADD COLUMN `mov_velocidad` DECIMAL(6, 1) NULL;

-- CreateIndex
CREATE INDEX `asignaciones_auditoria_estado_id_usuario_auditor_idx` ON `asignaciones_auditoria`(`estado`, `id_usuario_auditor`);

-- CreateIndex
CREATE INDEX `expedientes_disponibles_idx` ON `expedientes`(`estado`, `autoasignable`, `departamento`, `fecha_creacion`);

-- CreateIndex
CREATE INDEX `tracking_ubicacion_registrado_en_idx` ON `tracking_ubicacion`(`registrado_en`);
