-- Índices para el Resumen del panel (asignaciones por día, visitas por día y distritos): sin ellos cada consulta recorre toda la tabla de la empresa.
-- CreateIndex
CREATE INDEX `asignaciones_auditoria_empresa_id_fecha_asignacion_idx` ON `asignaciones_auditoria`(`empresa_id`, `fecha_asignacion`);

-- CreateIndex
CREATE INDEX `visitas_auditoria_empresa_id_fecha_hora_checkin_idx` ON `visitas_auditoria`(`empresa_id`, `fecha_hora_checkin`);
