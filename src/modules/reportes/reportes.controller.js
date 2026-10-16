import reportesService from './reportes.service.js';
import resumenService from './resumen.service.js';

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

export default { wordVisita, resumen };
