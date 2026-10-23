-- Jornadas de campo con zona: cada «Iniciar jornada» queda en un historial con la posición del celular en ese momento y la zona (distrito, provincia y
-- departamento); la última zona también se guarda en el usuario. Las columnas nuevas del usuario son nulas (se agregan al instante).
-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `zona_departamento` VARCHAR(100) NULL,
    ADD COLUMN `zona_distrito` VARCHAR(100) NULL,
    ADD COLUMN `zona_en` DATETIME(3) NULL,
    ADD COLUMN `zona_provincia` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `jornadas_campo` (
    `id_jornada` INTEGER NOT NULL AUTO_INCREMENT,
    `empresa_id` VARCHAR(36) NOT NULL,
    `id_usuario` VARCHAR(36) NOT NULL,
    `inicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fin` DATETIME(3) NULL,
    `cierre` VARCHAR(12) NULL,
    `latitud` DECIMAL(10, 8) NULL,
    `longitud` DECIMAL(11, 8) NULL,
    `precision_metros` DECIMAL(8, 2) NULL,
    `simulada` BOOLEAN NOT NULL DEFAULT false,
    `departamento` VARCHAR(100) NULL,
    `provincia` VARCHAR(100) NULL,
    `distrito` VARCHAR(100) NULL,

    INDEX `jornadas_campo_empresa_id_id_usuario_inicio_idx`(`empresa_id`, `id_usuario`, `inicio`),
    INDEX `jornadas_campo_empresa_id_inicio_idx`(`empresa_id`, `inicio`),
    PRIMARY KEY (`id_jornada`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jornadas_campo` ADD CONSTRAINT `jornadas_campo_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
