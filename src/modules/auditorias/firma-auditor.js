// La firma del auditor de campo cierra SU trabajo: se pide en todos los resultados, también en «no ubicado» y «rechazado», porque él da fe de lo que hizo.
// Solo se exige a las apps que declaran la ficha 2 o mayor (`ficha_version`): las apps anteriores no la tienen y siguen pudiendo enviar visitas mientras
// se actualizan. Con `obligatoria` (FIRMA_AUDITOR_OBLIGATORIA=true) se exige a todas.
export const FICHA_CON_FIRMA_AUDITOR = 2;

export function firmaAuditorExigida(payload, obligatoria = false) {
  return Boolean(obligatoria) || (payload.ficha_version ?? 1) >= FICHA_CON_FIRMA_AUDITOR;
}

export function validarFirmaAuditor(payload, obligatoria = false) {
  if (firmaAuditorExigida(payload, obligatoria) && !payload.firma_auditor) {
    throw Object.assign(new Error('Falta la firma del auditor de campo.'), { statusCode: 422, code: 'FIRMA_AUDITOR_REQUIRED' });
  }
}
