-- Cola de busqueda en el mapa para las direcciones de los negocios o empleadores (viven dentro de datos_negocio):
-- PENDIENTE = alguno sin coordenadas por buscar; LISTO = ya se buscaron; NULL = el expediente no tiene negocios.
ALTER TABLE `expedientes` ADD COLUMN `geo_negocios_estado` VARCHAR(15) NULL;
CREATE INDEX `expedientes_geo_negocios_estado_idx` ON `expedientes`(`geo_negocios_estado`);
