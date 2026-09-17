-- CreateTable
CREATE TABLE `tracking_ubicacion` (
    `id_tracking` BIGINT NOT NULL AUTO_INCREMENT,
    `id_usuario` VARCHAR(36) NOT NULL,
    `latitud` DECIMAL(10, 8) NOT NULL,
    `longitud` DECIMAL(11, 8) NOT NULL,
    `precision_metros` DECIMAL(8, 2) NULL,
    `registrado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tracking_ubicacion_id_usuario_registrado_en_idx`(`id_usuario`, `registrado_en`),
    PRIMARY KEY (`id_tracking`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tracking_ubicacion` ADD CONSTRAINT `tracking_ubicacion_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
