-- AlterTable
ALTER TABLE `auditoria_seguridad` ADD COLUMN `entidad` VARCHAR(50) NULL,
    ADD COLUMN `entidad_id` VARCHAR(64) NULL,
    ADD COLUMN `valor_anterior` JSON NULL,
    ADD COLUMN `valor_nuevo` JSON NULL;
