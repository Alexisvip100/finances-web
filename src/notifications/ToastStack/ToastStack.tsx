import React, { useEffect } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { colors } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { IconCircle } from '../../components/Misc';
import { Pressable } from '../../components/Pressable';
import { Portal } from '../../components/Portal';
import type { ToastItem } from '../types';
import {
  IOS_EASE,
  styles,
  SUCCESS_AUTO_DISMISS_MS,
  TOAST_META,
  UPDATE_AUTO_DISMISS_MS,
} from './ToastStack.styles';

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
      <div style={styles.stackContainer}>
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
      style={styles.banner}
    >
      <div style={styles.contentRow}>
        <IconCircle name={meta.icon} bg={meta.bg} color={meta.color} size={36} />
        <div style={styles.textWrap}>
          <p style={styles.title}>{toast.title ?? meta.title}</p>
          <p style={styles.message}>{toast.message}</p>
        </div>
        <Pressable onClick={onDismiss} style={styles.closeBtn} aria-label="Cerrar">
          <Icon name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </div>

      {isSuccess ? null : (
        <div style={styles.actionsRow}>
          {isUpdate ? (
            <Pressable onClick={onAcceptUpdate} style={styles.updateBtn}>
              Actualizar
            </Pressable>
          ) : (
            <>
              <Pressable
                onClick={onRetry}
                disabled={retrying}
                style={styles.retryBtn(retrying)}
              >
                {retrying ? 'Reintentando…' : 'Reintentar'}
              </Pressable>
              <Pressable
                onClick={onDismiss}
                style={styles.dismissBtn}
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
