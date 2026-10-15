-- AlterTable
ALTER TABLE `importaciones_masivas` ADD COLUMN `advertencias` JSON NULL,
    ADD COLUMN `archivo_sha256` VARCHAR(64) NULL,
    ADD COLUMN `formato` VARCHAR(20) NULL;
