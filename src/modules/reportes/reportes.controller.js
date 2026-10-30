import reportesService from './reportes.service.js';
import resumenService from './resumen.service.js';
import efectividadService from './efectividad.service.js';

async function wordVisita(req, res, next) {
  try {
    const buffer = await reportesService.generarWordVisita(Number(req.params.id));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="ficha-visita-${req.params.id}.docx"`);
    res.send(buffer);
  } catch (error) { next(error); }
}

async function resumen(_req, res, next) {
  try { res.json({ data: await resumenService.obtenerResumen() }); } catch (error) { next(error); }
}

async function actividad(req, res, next) {
  try { res.json({ data: await resumenService.actividad(req.validated?.query || {}) }); } catch (error) { next(error); }
}

async function tablero(req, res, next) {
  try { res.json({ data: await resumenService.tablero(req.validated?.query || {}) }); } catch (error) { next(error); }
}

async function efectividad(req, res, next) {
  try { res.json({ data: await efectividadService.efectividad(req.validated.query) }); } catch (error) { next(error); }
}

// El Excel se arma completo en memoria (decenas de auditores, cientos de días, miles de visitas: pesa poco) y se manda de una vez.
async function efectividadExcel(req, res, next) {
  const q = req.validated.query;
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="efectividad-auditores-${q.desde}-a-${q.hasta}.xlsx"`);
    const { auditores, visitas } = await efectividadService.efectividadXlsx(q, { stream: res });
    req.auditContext = { entidad: 'Usuario', entidad_id: null, valor_anterior: null, valor_nuevo: { desde: q.desde, hasta: q.hasta, auditores, visitas } };
    res.end();
  } catch (error) {
    if (!res.headersSent) { res.removeHeader('Content-Disposition'); return next(error); }
    res.destroy(error);
  }
}

export default { wordVisita, resumen, actividad, tablero, efectividad, efectividadExcel };
