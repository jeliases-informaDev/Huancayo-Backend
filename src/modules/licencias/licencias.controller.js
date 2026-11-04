import { licenciaPublica } from './licencias.service.js';

// La licencia de la empresa de quien pregunta (el universal, la de la empresa elegida con x-empresa-id). null = licencias apagadas o sin empresa.
// ?refrescar=1 vuelve a preguntar a Sulotec sin esperar los 5 minutos de la caché (p. ej. recién renovada).
async function actual(req, res, next) {
  try {
    const empresaId = req.user?.empresa_id;
    res.json({ data: empresaId ? await licenciaPublica(empresaId, { forzar: req.query.refrescar === '1' }) : null });
  } catch (error) { next(error); }
}

export default { actual };
