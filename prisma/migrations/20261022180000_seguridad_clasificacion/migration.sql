-- Módulo de seguridad: cada evento del registro se guarda ya clasificado (acción, categoría, gravedad, plataforma) y con la marca de si trae un cambio
-- de datos. Las columnas se agregan al instante (nulas o con valor predeterminado), sin reconstruir la tabla; los registros anteriores quedan sin
-- clasificar y el panel los clasifica al mostrarlos.
-- AlterTable
ALTER TABLE `auditoria_seguridad` ADD COLUMN `accion` VARCHAR(40) NULL,
    ADD COLUMN `categoria` VARCHAR(16) NULL,
    ADD COLUMN `severidad` VARCHAR(8) NULL,
    ADD COLUMN `plataforma` VARCHAR(8) NULL,
    ADD COLUMN `con_cambios` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `auditoria_seguridad_empresa_id_categoria_fecha_idx` ON `auditoria_seguridad`(`empresa_id`, `categoria`, `fecha`);

-- CreateIndex
CREATE INDEX `auditoria_seguridad_empresa_id_severidad_fecha_idx` ON `auditoria_seguridad`(`empresa_id`, `severidad`, `fecha`);

-- CreateIndex
CREATE INDEX `auditoria_seguridad_empresa_id_actor_fecha_idx` ON `auditoria_seguridad`(`empresa_id`, `actor`, `fecha`);

-- CreateIndex
CREATE INDEX `auditoria_seguridad_empresa_id_entidad_id_idx` ON `auditoria_seguridad`(`empresa_id`, `entidad_id`);
