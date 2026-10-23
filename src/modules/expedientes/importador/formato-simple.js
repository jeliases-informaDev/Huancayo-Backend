import { esVacio, numero, texto } from './limpieza.js';
import { camposDeDireccion } from '../../geocodificacion/direcciones.js';

// Plantilla SIMPLE: una fila por expediente con las columnas mínimas para asignar y visitar. Aquí se revisa fila por fila ANTES de guardar nada:
// cada problema dice en qué campo está, qué pasa y qué hay que corregir (es lo que ve la persona en «Qué debes corregir» y en el reporte de errores).

export const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'RUC'];
const TIPOS_CREDITO = { CONSUMO: 'CONSUMO', OTROS: 'OTROS', MYPE: 'OTROS' };
const MONEDAS = { PEN: 'PEN', SOL: 'PEN', SOLES: 'PEN', 'S/': 'PEN', 'S/.': 'PEN', USD: 'USD', 'US$': 'USD', $: 'USD', DOLAR: 'USD', DOLARES: 'USD', 'DÓLARES': 'USD' };

// Largo máximo de cada campo (el de la base de datos) y cómo se llama en pantalla.
const LARGOS = {
  codigo_expediente: [50, 'Crédito', 'el número de crédito'], nombres_cliente: [200, 'Cliente', 'el nombre del cliente'], numero_documento_cliente: [20, 'Documento', 'el documento del cliente'],
  asesor_responsable: [150, 'Asesor', 'el nombre del asesor'], oficina: [100, 'Oficina', 'la oficina'], telefono_cliente: [20, 'Teléfono', 'el teléfono'],
  direccion_domicilio: [255, 'Dirección', 'la dirección'], distrito: [100, 'Distrito', 'el distrito'], provincia: [100, 'Provincia', 'la provincia'], departamento: [100, 'Departamento', 'el departamento'],
};

const comillas = (valor) => `«${String(valor).slice(0, 40)}»`;

/**
 * Revisa una fila de la plantilla SIMPLE.
 * @returns {{ errores: {campo:string, problema:string, corregir:string}[], advertencias: string[], codigo: string|null, data: object|null }}
 *   `data` (lo que se guarda, sin los datos de la importación) solo viene si la fila no tiene errores.
 */
export function validarFilaSimple(row) {
  const errores = [];
  const error = (campo, problema, corregir) => errores.push({ campo, problema, corregir });
  const valor = (clave) => { const v = row[clave]; return typeof v === 'number' ? String(v) : texto(v); };

  // Obligatorios y largos.
  const dato = {};
  for (const [clave, [max, campo, comoSeEscribe]] of Object.entries(LARGOS)) {
    const v = valor(clave);
    dato[clave] = v;
    const obligatorio = ['codigo_expediente', 'nombres_cliente', 'numero_documento_cliente', 'asesor_responsable'].includes(clave);
    if (!v && obligatorio) {
      const vacio = { Crédito: 'Crédito vacío', Cliente: 'Nombre del cliente vacío', Documento: 'Documento vacío', Asesor: 'Asesor vacío' }[campo];
      error(campo, vacio, `Completa ${comoSeEscribe}.`);
    } else if (v && v.length > max) {
      error(campo, `Demasiado largo (${v.length} caracteres)`, `Acorta ${comoSeEscribe}: admite hasta ${max} caracteres.`);
    }
  }

  // Tipo de crédito: Consumo o MYPE (en la base MYPE se guarda como OTROS).
  const tipoTexto = valor('tipo_credito');
  let tipoCredito = null;
  if (!tipoTexto) error('Tipo', 'Tipo vacío', 'Escribe Consumo o MYPE.');
  else if (TIPOS_CREDITO[tipoTexto.toUpperCase()]) tipoCredito = TIPOS_CREDITO[tipoTexto.toUpperCase()];
  else error('Tipo', `Valor ${comillas(tipoTexto)} no admitido`, 'Selecciona Consumo o MYPE.');

  // Documento: si no se indica el tipo se deduce del largo (11 = RUC, 9 = CE, el resto DNI), igual que en la base del core.
  const digitos = String(dato.numero_documento_cliente || '').replace(/\D/g, '');
  const tipoDocTexto = valor('tipo_documento_cliente');
  let tipoDocumento = digitos.length === 11 ? 'RUC' : digitos.length === 9 ? 'CE' : 'DNI';
  if (tipoDocTexto) {
    if (TIPOS_DOCUMENTO.includes(tipoDocTexto.toUpperCase())) tipoDocumento = tipoDocTexto.toUpperCase();
    else error('Tipo de documento', `Valor ${comillas(tipoDocTexto)} no admitido`, 'Usa DNI, CE, PASAPORTE o RUC (o deja la celda vacía).');
  }

  // Ubicación: las dos coordenadas juntas, en grados decimales.
  const coordenada = (clave, etiqueta, limite, ejemplo) => {
    const bruto = row[clave];
    if (esVacio(bruto)) return { vacia: true };
    const n = numero(bruto);
    if (n === null) { error('Ubicación', `${etiqueta} no válida`, `Escribe grados decimales, por ejemplo ${ejemplo}.`); return { invalida: true }; }
    if (Math.abs(n) > limite) { error('Ubicación', `${etiqueta} fuera de rango`, `${etiqueta} va entre -${limite} y ${limite}.`); return { invalida: true }; }
    return { n };
  };
  const lat = coordenada('latitud', 'Latitud', 90, '-11.9332');
  const lon = coordenada('longitud', 'Longitud', 180, '-77.0541');
  if (lat.vacia !== lon.vacia && !lat.invalida && !lon.invalida) error('Ubicación', lat.vacia ? 'Falta la latitud' : 'Falta la longitud', 'Completa las dos coordenadas o deja las dos vacías.');
  const conCoordenadas = lat.n !== undefined && lon.n !== undefined;

  // Monto y moneda.
  let monto = null;
  if (!esVacio(row.monto_desembolso)) {
    const n = numero(row.monto_desembolso);
    if (n === null) error('Monto', 'Monto no válido', 'Escribe solo números, con punto decimal (por ejemplo 12500.50).');
    else if (n < 0) error('Monto', 'Monto negativo', 'El monto desembolsado no puede ser negativo.');
    else if (n >= 1e10) error('Monto', 'Monto demasiado grande', 'Revisa el monto: admite hasta 9 999 999 999,99.');
    else monto = n;
  }
  let moneda = 'PEN';
  const monedaTexto = valor('moneda');
  if (monedaTexto) {
    if (MONEDAS[monedaTexto.toUpperCase()]) moneda = MONEDAS[monedaTexto.toUpperCase()];
    else error('Moneda', `Valor ${comillas(monedaTexto)} no admitido`, 'Usa PEN o USD.');
  }

  const codigo = dato.codigo_expediente || null;
  if (errores.length) return { errores, advertencias: [], codigo, data: null };

  const direccion = camposDeDireccion({ direccion: dato.direccion_domicilio, distrito: dato.distrito, provincia: dato.provincia, tieneCoordenadas: conCoordenadas });
  return {
    errores, advertencias: direccion.advertencias, codigo,
    data: {
      codigo_expediente: dato.codigo_expediente, tipo_credito: tipoCredito, oficina: dato.oficina, tipo_documento_cliente: tipoDocumento,
      numero_documento_cliente: dato.numero_documento_cliente, nombres_cliente: dato.nombres_cliente, telefono_cliente: dato.telefono_cliente,
      direccion_domicilio: dato.direccion_domicilio, distrito: dato.distrito, provincia: dato.provincia, departamento: dato.departamento,
      latitud: conCoordenadas ? lat.n : null, longitud: conCoordenadas ? lon.n : null, ubicacion_origen: conCoordenadas ? 'REFERENCIA' : null,
      asesor_responsable: dato.asesor_responsable, monto_desembolso: monto, moneda,
      ...direccion.campos,
    },
  };
}
