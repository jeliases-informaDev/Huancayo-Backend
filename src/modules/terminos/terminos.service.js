import prisma from '#core/config/prisma.js';
import { publica as empresaPublica } from '#modules/empresas/empresas.service.js';
import { VERSION_TERMINOS, exentoDeTerminos, plataformaDe, terminosVigentes } from './terminos.reglas.js';

// Lo que se guarda es la aceptación: usuario, versión, fecha, plataforma, IP y navegador/dispositivo. Una sola por usuario y
// versión (vale para la app y para el panel). Las consultas llevan el filtro de empresa del contexto, como todo lo demás.

const aceptacionVigente = (usuarioId) => prisma.aceptacionTerminos.findFirst({ where: { usuario_id: usuarioId, version: VERSION_TERMINOS }, orderBy: { fecha: 'desc' } });
const resumen = (a) => (a ? { aceptado: true, aceptado_en: a.fecha, plataforma: a.plataforma } : { aceptado: false, aceptado_en: null, plataforma: null });

async function obtener(usuario) {
  const empresa = await empresaPublica();
  const texto = terminosVigentes(empresa?.marca?.nombre || empresa?.nombre_corto || empresa?.nombre);
  if (exentoDeTerminos(usuario.rol)) return { ...texto, exento: true, aceptado: true, aceptado_en: null, plataforma: null };
  return { ...texto, exento: false, ...resumen(await aceptacionVigente(usuario.id)) };
}

async function aceptar(usuario, { version, plataforma, ip, userAgent }) {
  if (version !== VERSION_TERMINOS) {
    throw Object.assign(new Error(`Los términos cambiaron (versión vigente ${VERSION_TERMINOS}). Vuelve a leerlos y acéptalos.`), { statusCode: 409, code: 'TERMINOS_VERSION' });
  }
  if (exentoDeTerminos(usuario.rol)) return { version, exento: true, aceptado: true, aceptado_en: null, plataforma: null };
  const previa = await aceptacionVigente(usuario.id);
  if (previa) return { version, exento: false, ...resumen(previa), repetida: true };
  try {
    const creada = await prisma.aceptacionTerminos.create({
      data: { usuario_id: usuario.id, version, plataforma, ip: ip ? String(ip).slice(0, 64) : null, user_agent: userAgent ? String(userAgent).slice(0, 255) : null },
    });
    return { version, exento: false, ...resumen(creada), id_aceptacion: creada.id_aceptacion };
  } catch (error) {
    // Dos aceptaciones a la vez (app y panel): la segunda encuentra la primera y la devuelve.
    if (error?.code === 'P2002') return { version, exento: false, ...resumen(await aceptacionVigente(usuario.id)), repetida: true };
    throw error;
  }
}

export default { obtener, aceptar, plataformaDe, VERSION_TERMINOS };
