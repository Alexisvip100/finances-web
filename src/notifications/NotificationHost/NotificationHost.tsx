import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ToastStack } from '../ToastStack';
import { UpdateModal } from '../UpdateModal';
import { registerSuccessListener, registerToastListener } from '../toastBus';
import { watchForNewVersion } from '../versionCheck';
import type { ToastItem } from '../types';

function genId(): string {
  return Math.random().toString(36).slice(2);
}

// Se monta una sola vez, al nivel raíz de la app (fuera del gate de
// auth/onboarding en main.tsx), para que los errores de red se puedan
// mostrar sin importar en qué pantalla esté el usuario.
export function NotificationHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const promptedVersionRef = useRef<string | null>(null);

  useEffect(() => {
    registerToastListener((input) => {
      setToasts((prev) => {
        if (input.requestKey && prev.some((t) => t.requestKey === input.requestKey)) return prev;
        return [...prev, { id: genId(), ...input }];
      });
    });
    registerSuccessListener((requestKey) => {
      setToasts((prev) => prev.filter((t) => t.requestKey !== requestKey));
    });
    return () => {
      registerToastListener(null);
      registerSuccessListener(null);
    };
  }, []);

  useEffect(
    () =>
      watchForNewVersion((remoteVersion) => {
        if (promptedVersionRef.current === remoteVersion) return;
        promptedVersionRef.current = remoteVersion;
        setToasts((prev) => [...prev, { id: genId(), kind: 'update', message: 'Hay cambios nuevos listos para usar.' }]);
      }),
    []
  );

  const handleDismiss = useCallback((toast: ToastItem) => {
    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    // Si se ignoró o se quitó la notificación de actualización, el modal
    // central es el recordatorio de respaldo.
    if (toast.kind === 'update') setUpdateModalOpen(true);
  }, []);

  const handleRetry = useCallback(async (toast: ToastItem) => {
    if (!toast.onRetry) return;
    setRetryingId(toast.id);
    try {
      await toast.onRetry();
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    } catch {
      // Sigue sin conectar: se deja la notificación para que reintente de nuevo.
    } finally {
      setRetryingId(null);
    }
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      <ToastStack toasts={toasts} retryingId={retryingId} onDismiss={handleDismiss} onRetry={handleRetry} onAcceptUpdate={reload} />
      <UpdateModal open={updateModalOpen} onUpdate={reload} onDismiss={() => setUpdateModalOpen(false)} />
    </>
  );
}
