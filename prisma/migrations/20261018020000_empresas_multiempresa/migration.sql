-- Multiempresa: catalogo de empresas y empresa_id en todas las tablas con datos de clientes.
-- Todo lo que ya existe pasa a ser de la primera empresa (Caja Huancayo); despues se quita el valor por defecto
-- para que cada fila nueva lleve su empresa de forma explicita (el servidor la pone en cada consulta).

-- CreateTable
CREATE TABLE `empresas` (
    `id_empresa` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `nombre_corto` VARCHAR(60) NULL,
    `slug` VARCHAR(60) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    `configuracion` JSON NULL,
    `marca` JSON NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `empresas_slug_key`(`slug`),
    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Primera empresa: la unica que existia hasta ahora.
INSERT INTO `empresas` (`id_empresa`, `nombre`, `nombre_corto`, `slug`, `estado`, `configuracion`, `marca`)
VALUES ('216bd472-029a-44ab-83fa-93889a0187fd', 'Caja Huancayo', 'Caja Huancayo', 'caja-huancayo', 'ACTIVA', NULL, JSON_OBJECT('producto', 'Auditoria de Visitas'));

-- DropIndex
DROP INDEX `asignaciones_auditoria_estado_id_usuario_auditor_idx` ON `asignaciones_auditoria`;
DROP INDEX `evidencias_hash_sha256_key` ON `evidencias`;
DROP INDEX `expedientes_codigo_expediente_key` ON `expedientes`;
DROP INDEX `expedientes_disponibles_idx` ON `expedientes`;

-- AlterTable: columnas obligatorias, con las filas existentes marcadas como de la primera empresa
ALTER TABLE `asignaciones_auditoria` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `asignaciones_auditoria` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `configuracion_sistema` DROP PRIMARY KEY,
    ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd',
    ADD PRIMARY KEY (`empresa_id`, `clave`);
ALTER TABLE `configuracion_sistema` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `dispositivos_autorizados` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `dispositivos_autorizados` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `eventos_campo` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `eventos_campo` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `evidencias` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `evidencias` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `expediente_cambios` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `expediente_cambios` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `expedientes` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `expedientes` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `importaciones_masivas` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `importaciones_masivas` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `tracking_ubicacion` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `tracking_ubicacion` ALTER COLUMN `empresa_id` DROP DEFAULT;

ALTER TABLE `visitas_auditoria` ADD COLUMN `empresa_id` VARCHAR(36) NOT NULL DEFAULT '216bd472-029a-44ab-83fa-93889a0187fd';
ALTER TABLE `visitas_auditoria` ALTER COLUMN `empresa_id` DROP DEFAULT;

-- AlterTable: columnas que admiten nulo (administrador universal de Sulotec; eventos de seguridad sin empresa)
ALTER TABLE `auditoria_seguridad` ADD COLUMN `empresa_id` VARCHAR(36) NULL;
UPDATE `auditoria_seguridad` SET `empresa_id` = '216bd472-029a-44ab-83fa-93889a0187fd' WHERE `empresa_id` IS NULL;

ALTER TABLE `usuarios` ADD COLUMN `empresa_id` VARCHAR(36) NULL;
UPDATE `usuarios` SET `empresa_id` = '216bd472-029a-44ab-83fa-93889a0187fd' WHERE `empresa_id` IS NULL;

-- CreateIndex
CREATE INDEX `asignaciones_auditoria_empresa_id_estado_id_usuario_auditor_idx` ON `asignaciones_auditoria`(`empresa_id`, `estado`, `id_usuario_auditor`);
CREATE INDEX `auditoria_seguridad_empresa_id_fecha_idx` ON `auditoria_seguridad`(`empresa_id`, `fecha`);
CREATE INDEX `dispositivos_autorizados_empresa_id_idx` ON `dispositivos_autorizados`(`empresa_id`);
CREATE INDEX `eventos_campo_empresa_id_registrado_en_idx` ON `eventos_campo`(`empresa_id`, `registrado_en`);
CREATE UNIQUE INDEX `evidencias_empresa_id_hash_sha256_key` ON `evidencias`(`empresa_id`, `hash_sha256`);
CREATE INDEX `expediente_cambios_empresa_id_idx` ON `expediente_cambios`(`empresa_id`);
CREATE INDEX `expedientes_empresa_id_estado_idx` ON `expedientes`(`empresa_id`, `estado`);
CREATE INDEX `expedientes_disponibles_idx` ON `expedientes`(`empresa_id`, `estado`, `autoasignable`, `departamento`, `fecha_creacion`);
CREATE UNIQUE INDEX `expedientes_empresa_id_codigo_expediente_key` ON `expedientes`(`empresa_id`, `codigo_expediente`);
CREATE INDEX `importaciones_masivas_empresa_id_fecha_creacion_idx` ON `importaciones_masivas`(`empresa_id`, `fecha_creacion`);
CREATE INDEX `tracking_ubicacion_empresa_id_idx` ON `tracking_ubicacion`(`empresa_id`);
CREATE INDEX `usuarios_empresa_id_rol_idx` ON `usuarios`(`empresa_id`, `rol`);
CREATE INDEX `visitas_auditoria_empresa_id_fecha_creacion_idx` ON `visitas_auditoria`(`empresa_id`, `fecha_creacion`);
