// Puente entre código que no es React (el interceptor de axios en api/client.ts)
// y el estado de React que dibuja las notificaciones. El interceptor nunca
// importa componentes; solo llama a estas funciones, y NotificationHost se
// registra como listener una vez, al montar.

export type ToastKind = 'error' | 'update' | 'success';

export interface ToastInput {
  kind: ToastKind;
  message: string;
  title?: string;
  // Si dos errores vienen del mismo endpoint (ej. reintentos automáticos de
  // varias pantallas pidiendo lo mismo), no apilar notificaciones duplicadas.
  requestKey?: string;
  onRetry?: () => Promise<unknown>;
}

type ToastListener = (toast: ToastInput) => void;
type SuccessListener = (requestKey: string) => void;

let toastListener: ToastListener | null = null;
let successListener: SuccessListener | null = null;

export function registerToastListener(fn: ToastListener | null) {
  toastListener = fn;
}

export function registerSuccessListener(fn: SuccessListener | null) {
  successListener = fn;
}

export function pushToast(toast: ToastInput) {
  toastListener?.(toast);
}

// Se llama cuando una petición contesta bien — si había una notificación de
// error para ese mismo endpoint, se quita sola (ya no aplica).
export function notifyRequestSucceeded(requestKey: string) {
  successListener?.(requestKey);
}
