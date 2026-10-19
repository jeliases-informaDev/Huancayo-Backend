import { ROLES, normalizeRole } from '#core/security/roles.js';

// Términos y condiciones de uso de la app y del panel, versionados: al cambiar el texto se sube la versión y todos
// los usuarios vuelven a aceptar antes de seguir. El nombre de la empresa se inserta al mostrarlos (cada empresa
// cliente ve el suyo). Reglas puras, sin base de datos, para poder probarlas solas.
export const VERSION_TERMINOS = '1.0';

export function terminosVigentes(nombreEmpresa) {
  const empresa = nombreEmpresa || 'la empresa';
  return {
    version: VERSION_TERMINOS,
    titulo: 'Términos y condiciones',
    subtitulo: 'Léelos y acéptalos para empezar a usar la aplicación.',
    secciones: [
      {
        titulo: 'Uso de la aplicación',
        texto: `La aplicación y el panel son de uso exclusivo del personal autorizado de ${empresa} para registrar y supervisar visitas de campo. Tus credenciales son personales e intransferibles: todo lo que se registre con ellas se considera hecho por ti.`,
      },
      {
        titulo: 'Ubicación y evidencia',
        texto: 'Durante tu jornada de campo, la aplicación registra tu ubicación GPS y las fotografías, firmas y datos que captures en cada visita, para verificar que la visita se realizó en el lugar y en el momento declarados. Fuera de la jornada no se registra tu ubicación.',
      },
      {
        titulo: 'Tratamiento de datos personales',
        texto: `Los datos de los clientes visitados y los tuyos se tratan conforme a la Ley N.º 29733, Ley de Protección de Datos Personales, y a la política de privacidad de ${empresa}. Se usan únicamente para la auditoría de visitas, se conservan el tiempo que exige la normativa y no se comparten con terceros ajenos al servicio.`,
      },
      {
        titulo: 'Trazabilidad',
        texto: 'Cada acción queda registrada con quién la hizo, cuándo y desde qué dispositivo. Las fichas cerradas no se pueden modificar; cualquier corrección se registra como una observación adicional.',
      },
      {
        titulo: 'Aceptación',
        texto: 'Al aceptar declaras haber leído estos términos y la política de privacidad. Si cambian, se te pedirá aceptar la nueva versión antes de continuar.',
      },
    ],
  };
}

// El administrador universal es personal de Sulotec: no es usuario final de la empresa y no firma sus términos.
export const exentoDeTerminos = (rol) => normalizeRole(rol) === ROLES.UNIVERSAL;

// La plataforma sale de la cabecera que ya mandan la app y el panel (x-client-platform), nunca del cuerpo de la petición.
export const plataformaDe = (cabecera) => (String(cabecera || '').trim().toLowerCase() === 'mobile' ? 'MOVIL' : 'WEB');
