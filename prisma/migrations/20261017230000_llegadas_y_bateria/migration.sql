-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `bateria_cargando` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `bateria_porcentaje` INTEGER NULL;

-- CreateTable
CREATE TABLE `eventos_campo` (
    `id_evento` BIGINT NOT NULL AUTO_INCREMENT,
    `id_usuario` VARCHAR(36) NOT NULL,
    `id_expediente` INTEGER NOT NULL,
    `punto` VARCHAR(20) NOT NULL,
    `tipo` VARCHAR(10) NOT NULL,
    `distancia_m` DECIMAL(8, 2) NULL,
    `latitud` DECIMAL(10, 8) NOT NULL,
    `longitud` DECIMAL(11, 8) NOT NULL,
    `registrado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `eventos_campo_id_usuario_registrado_en_idx`(`id_usuario`, `registrado_en`),
    INDEX `eventos_campo_id_expediente_idx`(`id_expediente`),
    PRIMARY KEY (`id_evento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `eventos_campo` ADD CONSTRAINT `eventos_campo_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos_campo` ADD CONSTRAINT `eventos_campo_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes`(`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;
