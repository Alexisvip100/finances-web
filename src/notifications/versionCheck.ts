import { APP_VERSION } from './version.generated';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

// Compara la versión embebida en el bundle que ya está corriendo contra
// public/version.json (se sirve tal cual, sin caché de bundler, así que
// siempre trae lo último desplegado). Si cambió, alguien hizo un nuevo
// build — típicamente un push a main que Vercel ya desplegó.
export function watchForNewVersion(onNewVersion: (remoteVersion: string) => void): () => void {
  let cancelled = false;

  async function check() {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data: { version?: string } = await res.json();
      if (!cancelled && data.version && data.version !== APP_VERSION) {
        onNewVersion(data.version);
      }
    } catch {
      // Sin conexión momentánea: se reintenta en el siguiente ciclo, no amerita notificación.
    }
  }

  check();
  const interval = setInterval(check, POLL_INTERVAL_MS);

  const onVisible = () => {
    if (document.visibilityState === 'visible') check();
  };
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', onVisible);

  return () => {
    cancelled = true;
    clearInterval(interval);
    window.removeEventListener('focus', check);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
