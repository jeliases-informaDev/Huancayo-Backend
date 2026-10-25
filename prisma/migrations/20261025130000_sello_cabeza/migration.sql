-- Cabeza de la cadena del sello de auditoría: una sola fila que sirve de candado (SELECT … FOR UPDATE dentro de la transacción que anota y sella)
-- y refleja el último número y sello. El candado de fila se suelta solo al confirmar la transacción, así dos anotaciones nunca reciben el mismo número.
CREATE TABLE `auditoria_sello_cabeza` (
  `id` INTEGER NOT NULL,
  `secuencia` INTEGER NOT NULL,
  `sello` CHAR(64) NOT NULL,
  `actualizado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `auditoria_sello_cabeza` (`id`, `secuencia`, `sello`) VALUES (1, 0, REPEAT('0', 64));
