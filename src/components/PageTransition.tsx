import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../theme/theme';

// Misma curva que usa UIKit para presentar sheets/pushes — no es un ease-out
// genérico, es la que hace que se sienta "como iOS" y no como un slide plano.
const IOS_EASE = [0.32, 0.72, 0, 1] as const;

const fullScreenStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: colors.background,
  overflowY: 'auto',
  zIndex: 10,
};

// Modal: para "crear/editar algo" (formularios, registrar gasto) — como
// presentar un sheet en iOS, entra deslizando desde abajo.
export function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      style={fullScreenStyle}
      initial={{ y: '100%' }}
      animate={{ y: 0, transition: { duration: 0.35, ease: IOS_EASE } }}
      exit={{ y: '100%', transition: { duration: 0.3, ease: IOS_EASE } }}
    >
      {children}
    </motion.div>
  );
}

// Push: para "ver el detalle de algo" (drill-down en una lista) — como un
// push de UINavigationController, entra deslizando desde la derecha.
export function Push({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      style={fullScreenStyle}
      initial={{ x: '100%' }}
      animate={{ x: 0, transition: { duration: 0.32, ease: IOS_EASE } }}
      exit={{ x: '100%', transition: { duration: 0.28, ease: IOS_EASE } }}
    >
      {children}
    </motion.div>
  );
}
