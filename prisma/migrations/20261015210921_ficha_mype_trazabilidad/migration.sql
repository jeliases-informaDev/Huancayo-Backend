-- AlterTable
ALTER TABLE `asignaciones_auditoria` ADD COLUMN `asignado_por` VARCHAR(36) NULL,
    ADD COLUMN `origen` VARCHAR(20) NOT NULL DEFAULT 'SUPERVISOR';

-- AlterTable
ALTER TABLE `expedientes` ADD COLUMN `advertencias_origen` JSON NULL,
    ADD COLUMN `fila_origen` INTEGER NULL,
    ADD COLUMN `hash_origen` VARCHAR(64) NULL,
    ADD COLUMN `id_importacion` VARCHAR(36) NULL,
    ADD COLUMN `ubicacion_origen` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `visitas_auditoria` ADD COLUMN `conformidad_financiera` JSON NULL,
    ADD COLUMN `estado_negocio` VARCHAR(30) NULL,
    ADD COLUMN `expediente_snapshot` JSON NULL,
    ADD COLUMN `firmante_documento` VARCHAR(20) NULL,
    ADD COLUMN `otros_pasivos` VARCHAR(500) NULL,
    ADD COLUMN `plantilla` VARCHAR(20) NULL,
    ADD COLUMN `propiedad_local` VARCHAR(30) NULL;

-- CreateTable
CREATE TABLE `expediente_cambios` (
    `id_cambio` BIGINT NOT NULL AUTO_INCREMENT,
    `id_expediente` INTEGER NOT NULL,
    `id_importacion` VARCHAR(36) NULL,
    `actor_id` VARCHAR(36) NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `cambios` JSON NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `expediente_cambios_id_expediente_fecha_idx`(`id_expediente`, `fecha`),
    INDEX `expediente_cambios_id_importacion_idx`(`id_importacion`),
    PRIMARY KEY (`id_cambio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `expedientes_id_importacion_idx` ON `expedientes`(`id_importacion`);

-- AddForeignKey
ALTER TABLE `expediente_cambios` ADD CONSTRAINT `expediente_cambios_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes`(`id_expediente`) ON DELETE CASCADE ON UPDATE CASCADE;
