// Sella las anotaciones del registro de auditoría que no tienen sello (las anteriores a la migración del sello, o alguna guardada sin sellar) y
// verifica la cadena. El servidor lo hace solo en segundo plano al arrancar; este guion es para hacerlo a mano o para ver el estado:
//   node scripts/sellar-registro.js
import { asegurarCabeza, sellarPendientes, verificar } from '../src/modules/sistema/sello.service.js';
import prisma from '../src/core/config/prisma.js';

try {
  await asegurarCabeza();
  const selladas = await sellarPendientes();
  const r = await verificar({ ultimas: 100000 });
  console.log(`Sello del registro de auditoría: ${selladas} anotaciones selladas ahora; cadena ${r.ok ? 'intacta' : 'ROTA'} (${r.revisadas} revisadas, n.° ${r.desde ?? '-'} a ${r.hasta ?? '-'}; sin sellar: ${r.sin_sellar})${r.rotura ? ` → n.° ${r.rotura.secuencia}: ${r.rotura.detalle}` : ''}`);
  process.exit(r.ok ? 0 : 2);
} catch (error) {
  console.error('No se pudo sellar el registro de auditoría:', error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect().catch(() => {});
}
