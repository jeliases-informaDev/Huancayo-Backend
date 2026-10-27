-- Firma del auditor de campo al cierre de su trabajo (PNG en data URL, igual que la del cliente).
-- Queda nula en las visitas anteriores y en las que envian apps que todavia no la piden.
ALTER TABLE `visitas_auditoria` ADD COLUMN `firma_auditor` TEXT NULL;
