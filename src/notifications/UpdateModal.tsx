import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { IconCircle } from '../components/Misc';
import { Pressable } from '../components/Pressable';
import { Portal } from '../components/Portal';

const IOS_EASE = [0.32, 0.72, 0, 1] as const;

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
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xl,
            }}
          >
            <div onClick={onDismiss} style={{ position: 'absolute', inset: 0, background: colors.overlay }} />
            <motion.div
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.22, ease: IOS_EASE }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 300,
                background: colors.surfaceAlt,
                borderRadius: radius.card,
                padding: spacing.xl,
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spacing.md }}>
                <IconCircle name="sparkles-outline" bg={colors.accentMuted} color={colors.accent} size={48} />
              </div>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Hubo una actualización</p>
              <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, margin: `${spacing.sm}px 0 0` }}>
                Hay cambios nuevos listos para usar. ¿Quieres actualizar ahora?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginTop: spacing.xl }}>
                <Pressable
                  onClick={onUpdate}
                  style={{
                    background: colors.accent,
                    color: colors.black,
                    borderRadius: radius.pill,
                    padding: `${spacing.md}px 0`,
                    fontSize: fontSize.md,
                    fontWeight: 800,
                  }}
                >
                  Actualizar
                </Pressable>
                <Pressable
                  onClick={onDismiss}
                  style={{
                    background: 'transparent',
                    color: colors.textSecondary,
                    padding: `${spacing.sm}px 0`,
                    fontSize: fontSize.md,
                    fontWeight: 700,
                  }}
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
