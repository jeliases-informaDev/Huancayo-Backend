-- Hora en que el celular tomo cada posicion del recorrido (la app la manda desde la version 0.4.0). Hasta ahora solo quedaba la hora de llegada al
-- servidor (registrado_en), que se atrasa cuando el celular pierde la senal; con las dos, el recorrido se ordena por la hora real.
ALTER TABLE `tracking_ubicacion` ADD COLUMN `capturado_en` DATETIME(3) NULL;
