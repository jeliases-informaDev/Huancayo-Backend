-- AlterTable
ALTER TABLE `expedientes` ADD COLUMN `departamento` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `expedientes_departamento_idx` ON `expedientes`(`departamento`);
