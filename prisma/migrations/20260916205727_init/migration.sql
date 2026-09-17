-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` VARCHAR(36) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `nombres` VARCHAR(150) NULL,
    `apellidos` VARCHAR(200) NULL,
    `email` VARCHAR(150) NULL,
    `sede` VARCHAR(100) NULL,
    `password_hash` TEXT NOT NULL,
    `rol` VARCHAR(20) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mfa_habilitado` BOOLEAN NOT NULL DEFAULT false,
    `mfa_requerido` BOOLEAN NOT NULL DEFAULT false,
    `mfa_exento` BOOLEAN NOT NULL DEFAULT false,
    `mfa_secreto` TEXT NULL,
    `mfa_ultimo_uso` DATETIME(3) NULL,
    `token_version` INTEGER NOT NULL DEFAULT 0,
    `intentos_fallidos` INTEGER NOT NULL DEFAULT 0,
    `bloqueado_hasta` DATETIME(3) NULL,
    `ultimo_acceso` DATETIME(3) NULL,
    `password_cambio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `latitud` DECIMAL(10, 8) NULL,
    `longitud` DECIMAL(11, 8) NULL,

    UNIQUE INDEX `usuarios_username_key`(`username`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositivos_autorizados` (
    `id_dispositivo` VARCHAR(36) NOT NULL,
    `id_usuario` VARCHAR(36) NOT NULL,
    `device_id` VARCHAR(150) NOT NULL,
    `nombre_dispositivo` VARCHAR(150) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `primer_uso` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimo_uso` DATETIME(3) NULL,

    INDEX `dispositivos_autorizados_id_usuario_idx`(`id_usuario`),
    UNIQUE INDEX `dispositivos_autorizados_id_usuario_device_id_key`(`id_usuario`, `device_id`),
    PRIMARY KEY (`id_dispositivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expedientes` (
    `id_expediente` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_expediente` VARCHAR(50) NOT NULL,
    `tipo_credito` ENUM('CONSUMO', 'OTROS') NOT NULL DEFAULT 'CONSUMO',
    `oficina` VARCHAR(100) NULL,
    `tipo_documento_cliente` ENUM('DNI', 'CE', 'PASAPORTE', 'RUC') NOT NULL DEFAULT 'DNI',
    `numero_documento_cliente` VARCHAR(20) NOT NULL,
    `nombres_cliente` VARCHAR(200) NOT NULL,
    `telefono_cliente` VARCHAR(20) NULL,
    `direccion_domicilio` VARCHAR(255) NULL,
    `distrito` VARCHAR(100) NULL,
    `provincia` VARCHAR(100) NULL,
    `latitud` DECIMAL(10, 8) NULL,
    `longitud` DECIMAL(11, 8) NULL,
    `asesor_responsable` VARCHAR(150) NOT NULL,
    `monto_desembolso` DECIMAL(12, 2) NULL,
    `moneda` VARCHAR(5) NULL,
    `datos_cliente` JSON NULL,
    `datos_negocio` JSON NULL,
    `datos_credito` JSON NULL,
    `evaluacion_financiera` JSON NULL,
    `endeudamiento` JSON NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizar` DATETIME(3) NOT NULL,

    UNIQUE INDEX `expedientes_codigo_expediente_key`(`codigo_expediente`),
    INDEX `expedientes_latitud_longitud_idx`(`latitud`, `longitud`),
    INDEX `expedientes_distrito_idx`(`distrito`),
    INDEX `expedientes_asesor_responsable_idx`(`asesor_responsable`),
    PRIMARY KEY (`id_expediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asignaciones_auditoria` (
    `id_asignacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_expediente` INTEGER NOT NULL,
    `id_usuario_auditor` VARCHAR(36) NOT NULL,
    `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_fin` DATETIME(3) NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    `prioridad` VARCHAR(20) NOT NULL DEFAULT 'MEDIA',

    INDEX `asignaciones_auditoria_id_usuario_auditor_idx`(`id_usuario_auditor`),
    INDEX `asignaciones_auditoria_id_expediente_idx`(`id_expediente`),
    PRIMARY KEY (`id_asignacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitas_auditoria` (
    `id_visita` INTEGER NOT NULL AUTO_INCREMENT,
    `client_sync_id` VARCHAR(100) NULL,
    `id_asignacion` INTEGER NULL,
    `id_expediente` INTEGER NOT NULL,
    `id_usuario_auditor` VARCHAR(36) NOT NULL,
    `fecha_hora_checkin` DATETIME(3) NOT NULL,
    `fecha_hora_checkout` DATETIME(3) NULL,
    `latitud` DECIMAL(10, 8) NOT NULL,
    `longitud` DECIMAL(11, 8) NOT NULL,
    `precision_metros` DECIMAL(8, 2) NULL,
    `distancia_domicilio_m` DECIMAL(10, 2) NULL,
    `mock_location` BOOLEAN NOT NULL DEFAULT false,
    `device_integrity_ok` BOOLEAN NOT NULL DEFAULT true,
    `device_id` VARCHAR(150) NULL,
    `server_received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resultado` VARCHAR(30) NOT NULL,
    `respuestas_cuestionario` JSON NOT NULL,
    `comentario_negocio` TEXT NULL,
    `comentario_auditor` TEXT NULL,
    `otros_clientes_domicilio` JSON NULL,
    `otros_ingresos` JSON NULL,
    `firma_evidencia` TEXT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizar` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visitas_auditoria_client_sync_id_key`(`client_sync_id`),
    INDEX `visitas_auditoria_id_expediente_idx`(`id_expediente`),
    INDEX `visitas_auditoria_id_usuario_auditor_fecha_hora_checkin_idx`(`id_usuario_auditor`, `fecha_hora_checkin`),
    PRIMARY KEY (`id_visita`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidencias` (
    `id_evidencia` VARCHAR(36) NOT NULL,
    `id_visita` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `object_key` VARCHAR(255) NOT NULL,
    `hash_sha256` VARCHAR(64) NOT NULL,
    `latitud_captura` DECIMAL(10, 8) NULL,
    `longitud_captura` DECIMAL(11, 8) NULL,
    `capturado_en` DATETIME(3) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `evidencias_hash_sha256_key`(`hash_sha256`),
    INDEX `evidencias_id_visita_idx`(`id_visita`),
    PRIMARY KEY (`id_evidencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria_seguridad` (
    `id_auditoria` VARCHAR(36) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `request_id` VARCHAR(100) NULL,
    `actor_id` VARCHAR(36) NULL,
    `actor` VARCHAR(50) NULL,
    `rol` VARCHAR(30) NULL,
    `metodo` VARCHAR(10) NOT NULL,
    `ruta` VARCHAR(255) NOT NULL,
    `estado_http` INTEGER NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `ip_hash` VARCHAR(64) NULL,
    `user_agent` VARCHAR(255) NULL,
    `device_id` VARCHAR(150) NULL,
    `mock_location` BOOLEAN NULL,

    INDEX `auditoria_seguridad_fecha_idx`(`fecha`),
    INDEX `auditoria_seguridad_actor_id_fecha_idx`(`actor_id`, `fecha`),
    PRIMARY KEY (`id_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `importaciones_masivas` (
    `id_importacion` VARCHAR(36) NOT NULL,
    `tipo` VARCHAR(30) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    `archivo` VARCHAR(255) NOT NULL,
    `ruta_temporal` TEXT NOT NULL,
    `actor_id` VARCHAR(36) NULL,
    `total_filas` INTEGER NOT NULL DEFAULT 0,
    `procesadas` INTEGER NOT NULL DEFAULT 0,
    `insertadas` INTEGER NOT NULL DEFAULT 0,
    `actualizadas` INTEGER NOT NULL DEFAULT 0,
    `omitidas` INTEGER NOT NULL DEFAULT 0,
    `errores` INTEGER NOT NULL DEFAULT 0,
    `detalle_error` JSON NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,

    INDEX `importaciones_masivas_estado_fecha_creacion_idx`(`estado`, `fecha_creacion`),
    INDEX `importaciones_masivas_actor_id_fecha_creacion_idx`(`actor_id`, `fecha_creacion`),
    PRIMARY KEY (`id_importacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dispositivos_autorizados` ADD CONSTRAINT `dispositivos_autorizados_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_auditoria` ADD CONSTRAINT `asignaciones_auditoria_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes`(`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_auditoria` ADD CONSTRAINT `asignaciones_auditoria_id_usuario_auditor_fkey` FOREIGN KEY (`id_usuario_auditor`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_auditoria` ADD CONSTRAINT `visitas_auditoria_id_expediente_fkey` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes`(`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitas_auditoria` ADD CONSTRAINT `visitas_auditoria_id_usuario_auditor_fkey` FOREIGN KEY (`id_usuario_auditor`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidencias` ADD CONSTRAINT `evidencias_id_visita_fkey` FOREIGN KEY (`id_visita`) REFERENCES `visitas_auditoria`(`id_visita`) ON DELETE RESTRICT ON UPDATE CASCADE;
