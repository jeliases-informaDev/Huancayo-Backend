-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `ubicacion_en` DATETIME(3) NULL,
    ADD COLUMN `ubicacion_precision` DECIMAL(8, 2) NULL,
    ADD COLUMN `ubicacion_simulada` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `tracking_ubicacion` ADD COLUMN `simulada` BOOLEAN NOT NULL DEFAULT false;
