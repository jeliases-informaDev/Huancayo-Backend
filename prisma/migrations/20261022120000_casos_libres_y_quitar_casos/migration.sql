-- Casos libres: «Disponibles» ya no depende del distrito del auditor, así que el índice de esa lista se rehace sin el departamento
-- (empresa, estado, autoasignable, antigüedad): la página pedida se lee del índice sin ordenar todos los pendientes.
DROP INDEX `expedientes_disponibles_idx` ON `expedientes`;

-- CreateIndex
CREATE INDEX `expedientes_disponibles_idx` ON `expedientes`(`empresa_id`, `estado`, `autoasignable`, `fecha_creacion`);

-- Quitar casos a un asesor: cómo terminó la asignación (motivo, quién y una nota). Columnas nulas: se agregan al instante, sin reconstruir la tabla.
-- AlterTable
ALTER TABLE `asignaciones_auditoria` ADD COLUMN `motivo_fin` VARCHAR(20) NULL,
    ADD COLUMN `fin_por` VARCHAR(36) NULL,
    ADD COLUMN `nota_fin` VARCHAR(200) NULL;
