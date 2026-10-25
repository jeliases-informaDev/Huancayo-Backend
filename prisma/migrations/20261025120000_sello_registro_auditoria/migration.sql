-- Sello de integridad del registro de auditoría: número correlativo y huella encadenada (ver src/modules/sistema/sello.core.js).
-- Las anotaciones anteriores a esta migración quedan sin sellar hasta que las selle el servidor al arrancar (scripts/sellar-registro.js).
ALTER TABLE `auditoria_seguridad`
  ADD COLUMN `secuencia` INTEGER NULL,
  ADD COLUMN `sello_previo` VARCHAR(64) NULL,
  ADD COLUMN `sello` VARCHAR(64) NULL;

CREATE UNIQUE INDEX `auditoria_seguridad_secuencia_key` ON `auditoria_seguridad`(`secuencia`);
