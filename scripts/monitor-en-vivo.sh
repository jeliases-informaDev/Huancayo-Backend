#!/usr/bin/env bash
# Tráfico REAL del API de Auditoría de Visitas, leído de sus propios registros (solo lectura: no escribe nada ni cambia ningún dato).
# Dice cuántas peticiones llegan por minuto, cuánto demora el servidor en responder (lo mide el propio servidor con tráfico real), cuántas fallan o
# fueron rechazadas por el límite por IP (429), cuántas posiciones de asesores llegan y cuántas conexiones hay abiertas ahora.
#   Uso:  bash monitor-en-vivo.sh [minutos=10] [contenedor=auditoria-api]
#   En vivo (se renueva cada 15 s):  while true; do clear; bash monitor-en-vivo.sh 5; sleep 15; done
MIN="${1:-10}"; CONT="${2:-auditoria-api}"
DOCKER="docker"; [ "$(id -u)" -ne 0 ] && ! docker ps >/dev/null 2>&1 && DOCKER="sudo docker"
LOG="$(mktemp)"; trap 'rm -f "$LOG"' EXIT
if [ -n "${LOG_ARCHIVO:-}" ]; then grep '"statusCode"' "$LOG_ARCHIVO" > "$LOG"; else $DOCKER logs --since "${MIN}m" "$CONT" 2>&1 | grep '"statusCode"' > "$LOG"; fi

# percentiles de una lista de números (uno por línea) en milisegundos
percentiles() { sort -n | awk 'function p(x, i) { i = int(NR * x); if (i < 1) i = 1; if (i > NR) i = NR; return a[i] } { a[NR] = $1 } END { if (!NR) { print "sin datos"; exit } printf "mediana %d ms | p95 %d ms | p99 %d ms | máximo %d ms", p(0.5), p(0.95), p(0.99), a[NR] }'; }
tiempos() { grep -o '"responseTime":[0-9]*' | cut -d: -f2; }

TOTAL=$(wc -l < "$LOG")
echo
echo "===== API EN VIVO — tráfico real de los últimos ${MIN} min ($(date '+%d/%m/%Y %H:%M:%S')) ====="
echo "Peticiones: ${TOTAL} → $(awk -v t="$TOTAL" -v m="$MIN" 'BEGIN { printf "%.1f por minuto (%.2f por segundo)", t / m, t / m / 60 }')"
echo "Tiempo de respuesta de todas: $(tiempos < "$LOG" | percentiles)"
echo
echo "Respuestas por código:"
grep -o '"statusCode":[0-9]*' "$LOG" | cut -d: -f2 | sort | uniq -c | sort -rn | awk '{ printf "   %s: %s\n", $2, $1 }'
N429=$(grep -c '"statusCode":429' "$LOG"); N5XX=$(grep -c '"statusCode":5' "$LOG")
[ "$N429" -gt 0 ] && echo "   ¡HAY ${N429} PETICIONES RECHAZADAS POR EL LÍMITE POR IP (429)! Alguien ya está chocando con el límite de 1 200 por IP cada 15 min."
[ "$N5XX" -gt 0 ] && echo "   ¡HAY ${N5XX} ERRORES DEL SERVIDOR (5xx)!"
echo
echo "Lo más pedido:"
grep -o '"method":"[A-Z]*","url":"[^"?]*' "$LOG" | sed -E 's/"method":"([A-Z]+)","url":"/\1 /; s#[0-9a-f]{8}-[0-9a-f-]{27}#:id#g; s#/[0-9]+#/:n#g' | sort | uniq -c | sort -rn | head -8 | awk '{ printf "   %6s  %s %s\n", $1, $2, $3 }'
echo
POS=$(grep -c '"url":"/api/visitas/ubicacion"' "$LOG")
echo "Posiciones de asesores: ${POS} → $(awk -v t="$POS" -v m="$MIN" 'BEGIN { printf "%.1f por minuto (%.2f por segundo; el límite medido de un servidor es de 100 a 125 por segundo)", t / m, t / m / 60 }')"
echo "   Tiempo de respuesta de las posiciones: $(grep '"url":"/api/visitas/ubicacion"' "$LOG" | tiempos | percentiles)"
IPS=$(grep -o '"cf-connecting-ip":"[^"]*"' "$LOG" | sort -u | wc -l)
[ "$IPS" -gt 0 ] && echo "Direcciones IP distintas (personas o redes) que pidieron algo: ${IPS}"
echo
if [ -z "${LOG_ARCHIVO:-}" ]; then
  CONEX=$($DOCKER exec "$CONT" sh -c "cat /proc/net/tcp /proc/net/tcp6 2>/dev/null | awk '\$2 ~ /:1004\$/ && \$4 == \"01\"' | wc -l" 2>/dev/null)
  echo "Conexiones abiertas ahora con el API (apps, paneles y sockets en vivo): ${CONEX:-?}"
  echo "TRUST_PROXY del servidor: $($DOCKER exec "$CONT" printenv TRUST_PROXY 2>/dev/null || echo '(no definido)')   (debe ser true para que el límite cuente por persona y no por red)"
  echo
  echo "Recursos ahora (CPU de 100 % = un núcleo):"
  $DOCKER stats --no-stream --format '   {{.Name}}: CPU {{.CPUPerc}} | memoria {{.MemUsage}} ({{.MemPerc}})' | head -12
  echo "   Máquina: $(nproc) núcleos, carga $(cut -d' ' -f1-3 /proc/loadavg), memoria libre $(awk '/MemAvailable/ { printf "%d MB", $2 / 1024 }' /proc/meminfo)"
fi
echo
