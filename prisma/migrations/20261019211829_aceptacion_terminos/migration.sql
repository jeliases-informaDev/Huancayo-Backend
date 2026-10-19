-- CreateTable
CREATE TABLE `aceptaciones_terminos` (
    `id_aceptacion` VARCHAR(36) NOT NULL,
    `empresa_id` VARCHAR(36) NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `plataforma` VARCHAR(10) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `aceptaciones_terminos_empresa_id_idx`(`empresa_id`),
    UNIQUE INDEX `aceptaciones_terminos_usuario_id_version_key`(`usuario_id`, `version`),
    PRIMARY KEY (`id_aceptacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aceptaciones_terminos` ADD CONSTRAINT `aceptaciones_terminos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
