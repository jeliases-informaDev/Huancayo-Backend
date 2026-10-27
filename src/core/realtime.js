// Avisos en vivo al panel. server.js registra el Socket.IO al arrancar; los módulos avisan sin tener que recibir la petición.
// Solo llegan a los administradores y supervisores de UNA empresa (nunca a las demás); el panel vuelve a pedir sus datos.
let io = null;

export function registrarIo(instancia) { io = instancia; }

export function avisarPanel(empresaId, evento, datos = {}) {
  if (!io || !empresaId) return;
  for (const rol of ['ADMINISTRADOR', 'SUPERVISOR']) io.to(`empresa:${empresaId}:role:${rol}`).emit(evento, datos);
}
