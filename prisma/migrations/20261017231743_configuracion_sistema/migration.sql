-- CreateTable
CREATE TABLE `configuracion_sistema` (
    `clave` VARCHAR(60) NOT NULL,
    `valor` VARCHAR(200) NOT NULL,
    `actualizado_por` VARCHAR(36) NULL,
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`clave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
