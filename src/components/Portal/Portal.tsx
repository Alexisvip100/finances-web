import { createPortal } from 'react-dom';

// Los overlays fixed (selector de categoría, listas de transacciones del
// ciclo, etc.) necesitan montarse fuera de <Sheet>/<Push> — esos animan con
// transform, y un ancestro con transform vuelve "position: fixed" relativo a
// él en vez de al viewport (por eso el fondo se movía en vez del modal).
export function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}
