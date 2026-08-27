import React, { useEffect } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Icon } from '../components/Icon';
import { IconCircle } from '../components/Misc';
import { Pressable } from '../components/Pressable';
import { Portal } from '../components/Portal';
import type { ToastItem } from './types';

const IOS_EASE = [0.32, 0.72, 0, 1] as const;
const UPDATE_AUTO_DISMISS_MS = 7000;
const SUCCESS_AUTO_DISMISS_MS = 2200;

const TOAST_META: Record<ToastItem['kind'], { title: string; icon: string; bg: string; color: string }> = {
  error: { title: 'No se pudo completar', icon: 'cloud-offline-outline', bg: colors.dangerMuted, color: colors.danger },
  update: { title: 'Actualización disponible', icon: 'sparkles-outline', bg: colors.accentMuted, color: colors.accent },
  success: { title: 'Listo', icon: 'checkmark-circle', bg: colors.accentMuted, color: colors.accent },
};

export function ToastStack({
  toasts,
  retryingId,
  onDismiss,
  onRetry,
  onAcceptUpdate,
}: {
  toasts: ToastItem[];
  retryingId: string | null;
  onDismiss: (toast: ToastItem) => void;
  onRetry: (toast: ToastItem) => void;
  onAcceptUpdate: () => void;
}) {
  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          top: 'max(env(safe-area-inset-top), 12px)',
          left: 0,
          right: 0,
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.sm,
          padding: `0 ${spacing.lg}px`,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastBanner
              key={toast.id}
              toast={toast}
              retrying={retryingId === toast.id}
              onDismiss={() => onDismiss(toast)}
              onRetry={() => onRetry(toast)}
              onAcceptUpdate={onAcceptUpdate}
            />
          ))}
        </AnimatePresence>
      </div>
    </Portal>
  );
}

function ToastBanner({
  toast,
  retrying,
  onDismiss,
  onRetry,
  onAcceptUpdate,
}: {
  toast: ToastItem;
  retrying: boolean;
  onDismiss: () => void;
  onRetry: () => void;
  onAcceptUpdate: () => void;
}) {
  const isUpdate = toast.kind === 'update';
  const isSuccess = toast.kind === 'success';
  const meta = TOAST_META[toast.kind];

  // Como una notificación de iOS: si no se toca, se retira sola después de un rato
  // (las de error se quedan — ahí sí importa que el usuario decida qué hacer).
  useEffect(() => {
    const autoDismissMs = isUpdate ? UPDATE_AUTO_DISMISS_MS : isSuccess ? SUCCESS_AUTO_DISMISS_MS : null;
    if (autoDismissMs === null) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, isSuccess]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y < -36 || info.velocity.y < -350) onDismiss();
  }

  return (
    <motion.div
      layout
      initial={{ y: -80, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -80, opacity: 0, scale: 0.96, transition: { duration: 0.22, ease: IOS_EASE } }}
      transition={{ duration: 0.38, ease: IOS_EASE }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.55, bottom: 0.05 }}
      onDragEnd={handleDragEnd}
      style={{
        pointerEvents: 'auto',
        width: '100%',
        maxWidth: 420,
        background: colors.surfaceAlt,
        borderRadius: radius.card,
        padding: spacing.lg,
        boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
        cursor: 'grab',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.md }}>
        <IconCircle name={meta.icon} bg={meta.bg} color={meta.color} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800, margin: 0 }}>{toast.title ?? meta.title}</p>
          <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, margin: '2px 0 0' }}>{toast.message}</p>
        </div>
        <Pressable onClick={onDismiss} style={{ padding: spacing.xs, flexShrink: 0 }} aria-label="Cerrar">
          <Icon name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </div>

      {isSuccess ? null : (
      <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
        {isUpdate ? (
          <Pressable
            onClick={onAcceptUpdate}
            style={{
              flex: 1,
              background: colors.accent,
              color: colors.black,
              borderRadius: radius.pill,
              padding: `${spacing.sm}px 0`,
              fontSize: fontSize.sm,
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            Actualizar
          </Pressable>
        ) : (
          <>
            <Pressable
              onClick={onRetry}
              disabled={retrying}
              style={{
                flex: 1,
                background: colors.accent,
                color: colors.black,
                borderRadius: radius.pill,
                padding: `${spacing.sm}px 0`,
                fontSize: fontSize.sm,
                fontWeight: 800,
                textAlign: 'center',
                opacity: retrying ? 0.7 : 1,
              }}
            >
              {retrying ? 'Reintentando…' : 'Reintentar'}
            </Pressable>
            <Pressable
              onClick={onDismiss}
              style={{
                flex: 1,
                background: colors.surface,
                color: colors.textSecondary,
                borderRadius: radius.pill,
                padding: `${spacing.sm}px 0`,
                fontSize: fontSize.sm,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              No mostrar
            </Pressable>
          </>
        )}
      </div>
      )}
    </motion.div>
  );
}
