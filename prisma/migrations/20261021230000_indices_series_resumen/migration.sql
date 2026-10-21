-- Índices para las series del gráfico del Resumen (una por tarjeta): expedientes cargados por día y visitas observadas por día.
-- Sin ellos cada consulta recorre todos los expedientes o todas las visitas de la empresa.
-- CreateIndex
CREATE INDEX `expedientes_empresa_id_fecha_creacion_idx` ON `expedientes`(`empresa_id`, `fecha_creacion`);

-- CreateIndex
CREATE INDEX `visitas_auditoria_empresa_id_resultado_fecha_hora_checkin_idx` ON `visitas_auditoria`(`empresa_id`, `resultado`, `fecha_hora_checkin`);
