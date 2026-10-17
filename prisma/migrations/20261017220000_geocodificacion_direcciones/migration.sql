-- AlterTable
ALTER TABLE `expedientes` ADD COLUMN `direccion_normalizada` VARCHAR(300) NULL,
    ADD COLUMN `direccion_componentes` JSON NULL,
    ADD COLUMN `geo_estado` VARCHAR(15) NULL,
    ADD COLUMN `geo_confianza` VARCHAR(10) NULL,
    ADD COLUMN `geo_precision` VARCHAR(12) NULL,
    ADD COLUMN `geo_proveedor` VARCHAR(12) NULL,
    ADD COLUMN `geo_latitud` DECIMAL(10, 8) NULL,
    ADD COLUMN `geo_longitud` DECIMAL(11, 8) NULL,
    ADD COLUMN `geo_direccion_encontrada` VARCHAR(400) NULL,
    ADD COLUMN `geo_fecha` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `expedientes_geo_estado_idx` ON `expedientes`(`geo_estado`);
