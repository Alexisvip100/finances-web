import React from 'react';
import { motion } from 'framer-motion';
import { fullScreenStyle, IOS_EASE } from './PageTransition.styles';

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
