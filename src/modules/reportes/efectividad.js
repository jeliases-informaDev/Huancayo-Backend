// Reporte de efectividad de los auditores de campo por periodo (lógica pura, sin base de datos: la consulta vive en efectividad.service.js). Junta, por
// auditor y por día, lo que hizo (casos cerrados y visitas con su resultado) con cómo se movió según el seguimiento en tiempo real (días en campo,
// horas de jornada, kilómetros recorridos, primera y última posición, llegadas detectadas) y las señales de alerta (visitas fuera de la geocerca,
// GPS simulado). Todo cuenta con los días del usuario (el servicio ya convierte las horas con su desfase).
export const RESULTADOS = ['CONFORME', 'OBSERVADO', 'NO_UBICADO', 'RECHAZADO'];
const DIA_MS = 24 * 60 * 60 * 1000;

const ms = (f) => (f instanceof Date ? f.getTime() : typeof f === 'number' ? f : Date.parse(f));
const redondear = (n, d = 1) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 10 ** d) / 10 ** d);
const proporcion = (parte, total) => (total > 0 ? Math.round((parte / total) * 1000) / 1000 : null);
const promedio = (lista) => (lista.length ? lista.reduce((s, x) => s + x, 0) / lista.length : null);
// Minutos del día (0-1439) de una hora dada en el huso del usuario, y de vuelta a «hh:mm».
export const minutosDelDia = (fecha, desfase = 0) => { const t = ms(fecha) - desfase * 60000; return Math.floor((t % DIA_MS + DIA_MS) % DIA_MS / 60000); };
export const horaDeMinutos = (min) => (min == null ? null : `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.round(min % 60)).padStart(2, '0')}`);
export const diaDe = (fecha, desfase = 0) => new Date(ms(fecha) - desfase * 60000).toISOString().slice(0, 10);

// Cuántos días tiene el periodo (ambos incluidos).
export const diasDelPeriodo = (desde, hasta) => Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / DIA_MS) + 1;

function filaVacia() {
  return {
    jornada_inicio: null, jornada_fin: null, horas_jornada: 0, jornadas_sin_cierre: 0,
    primera_posicion: null, ultima_posicion: null, km: null, puntos_gps: 0,
    visitas: 0, conforme: 0, observado: 0, no_ubicado: 0, rechazado: 0, casos_cerrados: 0, llegadas: 0, fuera_geocerca: 0, gps_simulado: 0,
  };
}

// Arma el reporte.
//   auditores: [{ id, nombre, usuario, zona, activo }]
//   visitas: [{ id_usuario, fecha, checkout, resultado, distancia_m, precision, simulada }] (fecha y checkout en UTC)
//   casos: Map id_usuario → { pendientes_inicio, asignados, finalizados }; cierres: [{ id_usuario, fecha }] (casos finalizados, con su fecha)
//   jornadas: [{ id_usuario, inicio, fin, cierre }]; llegadas: [{ id_usuario, id_expediente, fecha }]
//   recorridos: [{ id_usuario, dia, metros, puntos, primero, ultimo }] (ya por día del usuario, de la consulta sobre tracking_ubicacion)
export function armarEfectividad({ desde, hasta, desfase = 0, geocercaM = 100, auditores = [], visitas = [], casos = new Map(), cierres = [], jornadas = [], llegadas = [], recorridos = [] }) {
  const porAuditor = new Map(auditores.map((a) => [a.id, { ...a, dias: new Map() }]));
  const diaDeAuditor = (id, dia) => {
    const a = porAuditor.get(id);
    if (!a) return null;
    if (!a.dias.has(dia)) a.dias.set(dia, filaVacia());
    return a.dias.get(dia);
  };
  for (const j of jornadas) {
    const d = diaDeAuditor(j.id_usuario, diaDe(j.inicio, desfase));
    if (!d) continue;
    const inicio = minutosDelDia(j.inicio, desfase);
    if (d.jornada_inicio == null || inicio < d.jornada_inicio) d.jornada_inicio = inicio;
    if (j.fin) {
      const fin = minutosDelDia(j.fin, desfase);
      if (d.jornada_fin == null || fin > d.jornada_fin) d.jornada_fin = fin;
      d.horas_jornada += Math.max(0, ms(j.fin) - ms(j.inicio)) / 3600000;
    } else d.jornadas_sin_cierre += 1;
  }
  for (const r of recorridos) {
    const d = diaDeAuditor(r.id_usuario, r.dia);
    if (!d) continue;
    d.km = (d.km || 0) + Number(r.metros || 0) / 1000;
    d.puntos_gps += Number(r.puntos || 0);
    if (r.primero) { const m = minutosDelDia(r.primero, desfase); if (d.primera_posicion == null || m < d.primera_posicion) d.primera_posicion = m; }
    if (r.ultimo) { const m = minutosDelDia(r.ultimo, desfase); if (d.ultima_posicion == null || m > d.ultima_posicion) d.ultima_posicion = m; }
  }
  const duraciones = new Map(); const precisiones = new Map();
  for (const v of visitas) {
    const d = diaDeAuditor(v.id_usuario, diaDe(v.fecha, desfase));
    if (!d) continue;
    d.visitas += 1;
    const clave = String(v.resultado || '').toLowerCase();
    if (clave in d) d[clave] += 1;
    if (v.distancia_m != null && Number(v.distancia_m) > geocercaM) d.fuera_geocerca += 1;
    if (v.simulada) d.gps_simulado += 1;
    if (v.checkout && ms(v.checkout) > ms(v.fecha)) { if (!duraciones.has(v.id_usuario)) duraciones.set(v.id_usuario, []); duraciones.get(v.id_usuario).push((ms(v.checkout) - ms(v.fecha)) / 60000); }
    if (v.precision != null) { if (!precisiones.has(v.id_usuario)) precisiones.set(v.id_usuario, []); precisiones.get(v.id_usuario).push(Number(v.precision)); }
  }
  for (const c of cierres) { const d = diaDeAuditor(c.id_usuario, diaDe(c.fecha, desfase)); if (d) d.casos_cerrados += 1; }
  const clientesConLlegada = new Map();
  for (const l of llegadas) {
    const d = diaDeAuditor(l.id_usuario, diaDe(l.fecha, desfase));
    if (!d) continue;
    d.llegadas += 1;
    if (!clientesConLlegada.has(l.id_usuario)) clientesConLlegada.set(l.id_usuario, new Set());
    clientesConLlegada.get(l.id_usuario).add(l.id_expediente);
  }

  const filas = [];
  const dias = [];
  for (const a of porAuditor.values()) {
    const lista = [...a.dias.entries()].sort(([x], [y]) => (x < y ? -1 : 1));
    const suma = (clave) => lista.reduce((s, [, d]) => s + (d[clave] || 0), 0);
    const c = casos.get(a.id) || { pendientes_inicio: 0, asignados: 0, finalizados: 0 };
    const carga = c.pendientes_inicio + c.asignados;
    const diasEnCampo = lista.filter(([, d]) => d.visitas > 0 || d.jornada_inicio != null || d.km != null).length;
    const totalVisitas = suma('visitas');
    const fila = {
      id: a.id, nombre: a.nombre, usuario: a.usuario, zona: a.zona ?? null, activo: a.activo !== false,
      campo: {
        dias_en_campo: diasEnCampo,
        dias_con_jornada: lista.filter(([, d]) => d.jornada_inicio != null).length,
        horas_jornada: redondear(suma('horas_jornada')),
        jornadas_sin_cierre: suma('jornadas_sin_cierre'),
        km: lista.some(([, d]) => d.km != null) ? redondear(suma('km')) : null,
        puntos_gps: suma('puntos_gps'),
        inicio_promedio: horaDeMinutos(promedio(lista.map(([, d]) => d.primera_posicion ?? d.jornada_inicio).filter((x) => x != null))),
        fin_promedio: horaDeMinutos(promedio(lista.map(([, d]) => d.ultima_posicion ?? d.jornada_fin).filter((x) => x != null))),
      },
      casos: {
        pendientes_inicio: c.pendientes_inicio, asignados: c.asignados, finalizados: c.finalizados,
        pendientes_cierre: Math.max(0, carga - c.finalizados),
        cumplimiento: proporcion(c.finalizados, carga),
      },
      visitas: {
        total: totalVisitas, conforme: suma('conforme'), observado: suma('observado'), no_ubicado: suma('no_ubicado'), rechazado: suma('rechazado'),
        conformidad: proporcion(suma('conforme'), totalVisitas),
        por_dia_en_campo: diasEnCampo ? redondear(totalVisitas / diasEnCampo) : null,
        duracion_promedio_min: redondear(promedio(duraciones.get(a.id) || []), 0),
        precision_promedio_m: redondear(promedio(precisiones.get(a.id) || []), 0),
        llegadas: suma('llegadas'), clientes_con_llegada: clientesConLlegada.get(a.id)?.size || 0,
        fuera_geocerca: suma('fuera_geocerca'), gps_simulado: suma('gps_simulado'),
      },
    };
    // Un auditor inactivo sin nada en el periodo no sale; uno activo sale aunque esté en cero (así se nota quién no trabajó).
    if (fila.activo || totalVisitas || carga || diasEnCampo) filas.push(fila);
    for (const [dia, d] of lista) {
      dias.push({
        id_usuario: a.id, dia,
        jornada_inicio: horaDeMinutos(d.jornada_inicio), jornada_fin: horaDeMinutos(d.jornada_fin), horas_jornada: redondear(d.horas_jornada), jornadas_sin_cierre: d.jornadas_sin_cierre,
        primera_posicion: horaDeMinutos(d.primera_posicion), ultima_posicion: horaDeMinutos(d.ultima_posicion), km: redondear(d.km), puntos_gps: d.puntos_gps,
        visitas: d.visitas, conforme: d.conforme, observado: d.observado, no_ubicado: d.no_ubicado, rechazado: d.rechazado,
        casos_cerrados: d.casos_cerrados, llegadas: d.llegadas, fuera_geocerca: d.fuera_geocerca, gps_simulado: d.gps_simulado,
      });
    }
  }
  // Más visitas primero; a igual número, más cumplimiento; después por nombre.
  filas.sort((x, y) => y.visitas.total - x.visitas.total || (y.casos.cumplimiento || 0) - (x.casos.cumplimiento || 0) || x.nombre.localeCompare(y.nombre, 'es'));
  const sumaDe = (grupo, clave) => filas.reduce((s, f) => s + (f[grupo][clave] || 0), 0);
  const carga = sumaDe('casos', 'pendientes_inicio') + sumaDe('casos', 'asignados');
  const totales = {
    auditores: filas.length, auditores_con_visitas: filas.filter((f) => f.visitas.total > 0).length,
    dias_en_campo: sumaDe('campo', 'dias_en_campo'), horas_jornada: redondear(sumaDe('campo', 'horas_jornada')),
    km: filas.some((f) => f.campo.km != null) ? redondear(sumaDe('campo', 'km')) : null,
    pendientes_inicio: sumaDe('casos', 'pendientes_inicio'), asignados: sumaDe('casos', 'asignados'), finalizados: sumaDe('casos', 'finalizados'),
    pendientes_cierre: sumaDe('casos', 'pendientes_cierre'), cumplimiento: proporcion(sumaDe('casos', 'finalizados'), carga),
    visitas: sumaDe('visitas', 'total'), conforme: sumaDe('visitas', 'conforme'), observado: sumaDe('visitas', 'observado'), no_ubicado: sumaDe('visitas', 'no_ubicado'), rechazado: sumaDe('visitas', 'rechazado'),
    conformidad: proporcion(sumaDe('visitas', 'conforme'), sumaDe('visitas', 'total')),
    llegadas: sumaDe('visitas', 'llegadas'), fuera_geocerca: sumaDe('visitas', 'fuera_geocerca'), gps_simulado: sumaDe('visitas', 'gps_simulado'),
  };
  return { desde, hasta, dias_del_periodo: diasDelPeriodo(desde, hasta), geocerca_m: geocercaM, auditores: filas, totales, dias };
}
