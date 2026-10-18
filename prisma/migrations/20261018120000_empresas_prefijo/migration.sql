-- Abreviatura de la empresa: prefijo fijo de sus nombres de usuario (arq -> arq.jorge). Unica entre empresas; las existentes quedan sin
-- abreviatura (sus cuentas no se renombran) hasta que el administrador universal les ponga una.
ALTER TABLE `empresas` ADD COLUMN `prefijo` VARCHAR(8) NULL;
CREATE UNIQUE INDEX `empresas_prefijo_key` ON `empresas`(`prefijo`);
