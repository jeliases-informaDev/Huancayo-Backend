import { trazarRuta, rutasDisponibles } from './rutas.service.js';

async function estado(_req, res) { res.json({ data: { disponible: rutasDisponibles() } }); }

async function trazar(req, res, next) {
  try {
    const ruta = await trazarRuta((req.validated?.body || req.body).paradas);
    res.json({ data: ruta ? { disponible: true, ...ruta } : { disponible: false } });
  } catch (error) { next(error); }
}

export default { estado, trazar };
