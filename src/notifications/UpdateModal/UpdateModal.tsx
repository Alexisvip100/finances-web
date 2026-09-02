import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors } from '../../theme/theme';
import { IconCircle } from '../../components/Misc';
import { Pressable } from '../../components/Pressable';
import { Portal } from '../../components/Portal';
import { IOS_EASE, styles } from './UpdateModal.styles';

// El recordatorio si se ignoró o se cerró la notificación de arriba —
// estilo alerta central de iOS (UIAlertController), no un banner.
export function UpdateModal({ open, onUpdate, onDismiss }: { open: boolean; onUpdate: () => void; onDismiss: () => void }) {
  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={styles.modalOverlay}
          >
            <div onClick={onDismiss} style={styles.backdrop} />
            <motion.div
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.22, ease: IOS_EASE }}
              style={styles.modalCard}
            >
              <div style={styles.iconWrap}>
                <IconCircle name="sparkles-outline" bg={colors.accentMuted} color={colors.accent} size={48} />
              </div>
              <p style={styles.title}>Hubo una actualización</p>
              <p style={styles.description}>
                Hay cambios nuevos listos para usar. ¿Quieres actualizar ahora?
              </p>

              <div style={styles.btnStack}>
                <Pressable
                  onClick={onUpdate}
                  style={styles.updateBtn}
                >
                  Actualizar
                </Pressable>
                <Pressable
                  onClick={onDismiss}
                  style={styles.laterBtn}
                >
                  Después
                </Pressable>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
