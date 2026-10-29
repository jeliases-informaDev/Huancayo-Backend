-- Sugerencias temporales del mapa (Google solo permite guardar sus coordenadas 30 dias): cuando se buscaron los negocios por ultima vez,
-- para vencer sus sugerencias; y el consumo mensual de consultas al proveedor (tope para no pasar de la cuota gratuita). El consumo es
-- global, no por empresa: la clave del proveedor es una sola.
ALTER TABLE `expedientes` ADD COLUMN `geo_negocios_fecha` DATETIME(3) NULL;
CREATE INDEX `expedientes_geo_negocios_fecha_idx` ON `expedientes`(`geo_negocios_fecha`);
CREATE TABLE `geocodificacion_consumo` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `proveedor` VARCHAR(12) NOT NULL,
  `mes` VARCHAR(7) NOT NULL,
  `consultas` INTEGER NOT NULL DEFAULT 0,
  `actualizado` DATETIME(3) NOT NULL,
  UNIQUE INDEX `geocodificacion_consumo_proveedor_mes_key`(`proveedor`, `mes`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
