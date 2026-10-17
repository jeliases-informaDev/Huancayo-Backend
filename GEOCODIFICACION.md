# Direcciones y ubicación en el mapa

Cada expediente guarda la dirección del domicilio **ordenada** (tipo de vía, nombre, número, manzana/lote, urbanización, interior,
referencia) y con **avisos de calidad** (sin número, manzana y lote, sin tipo de vía, sin distrito…). Eso ocurre siempre, al importar
el Excel o al crear/editar un expediente, y no sale nada del servidor.

Buscar esa dirección en un **proveedor de mapas** (para sugerir sus coordenadas) está **apagado por defecto**: enviar direcciones de
clientes a un tercero requiere la autorización del banco. Al proveedor solo se le envía el texto de la dirección con distrito y
provincia, nunca el nombre ni el documento.

## Cómo se usa lo que devuelve el mapa

| Situación | Significado | ¿Sirve para medir los 100 m? |
|---|---|---|
| Ubicada, confianza **alta** | Punto exacto con el número y el distrito declarados. | **Sí**: pasa a ser la referencia (origen «GEOCODIFICADA») si el expediente no tenía coordenadas. |
| Ubicada, confianza media | Ubica la calle, no la puerta. | No. Es una **sugerencia**: un supervisor la acepta en el panel (Trazabilidad → «Usar esta ubicación») y pasa a referencia verificada. |
| Por revisar | El punto cae fuera del distrito declarado, o es manzana/lote. | No. |
| No se encontró / falló | Sin punto. | No. El auditor navega por la dirección escrita. |
| Verificada | La aceptó una persona. | Sí. |

La referencia no la define el auditor: así una visita hecha en otro lugar no se «convalida» sola (lo que sí pasaba cuando la primera
visita fijaba la ubicación).

## Proveedor y cómo encenderlo

- `GEOCODING_PROVIDER=nominatim` (por defecto): OpenStreetMap, gratis. Su política no admite cargas masivas (máximo 1 consulta por
  segundo): sirve para unos pocos miles de direcciones; el sistema va lento a propósito.
- `GEOCODING_PROVIDER=mapbox`: con clave, rápido y con nivel de precisión por dirección. Guardar coordenadas exige su modo
  permanente (tarjeta registrada, ~US$5 por cada 1,000 direcciones; confirmar el precio antes de activarlo).

Para encender: `GEOCODING_WORKER_ENABLED=true` (y, con Mapbox, `MAPBOX_ACCESS_TOKEN=<token>` en las variables del servidor, nunca en el
repositorio). Otras: `GEOCODING_BASE_URL`, `GEOCODING_DELAY_MS`, `GEOCODING_BATCH_SIZE`, `GEOCODING_INTERVAL_MS`,
`GEOCODING_APLICAR_ALTA=false` (no usar nunca el resultado como referencia automática; todo pasa por una persona).

En el panel (Expedientes) se ve cuántas direcciones hay en cada situación y, con la búsqueda encendida, los botones «Buscar
ubicaciones ahora» y «Reintentar las que fallaron».

## Pendiente

- Medir con 30–50 direcciones reales de Huancayo cuál proveedor acierta más antes de decidir (Radar 360 tiene un script de prueba).
- Ubicar también la dirección de los negocios (MYPE).
- Validar departamento/provincia/distrito contra el UBIGEO oficial del INEI.
