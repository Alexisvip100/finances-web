import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from '../config';
import { notifyRequestSucceeded, pushToast } from '../notifications/toastBus';

export const TOKEN_STORAGE_KEY = 'ciclos_access_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let cachedToken: string | null = null;

export function setAuthToken(token: string | null) {
  cachedToken = token;
}

apiClient.interceptors.request.use(async (config) => {
  const token = cachedToken ?? localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function requestKeyFor(error: AxiosError): string {
  return `${error.config?.method ?? ''}:${error.config?.url ?? ''}`;
}

// Solo problemas de "no se pudo hablar con el servidor" disparan la
// notificación global con reintentar — errores de validación (400/422) o de
// permisos (401/403) se siguen mostrando en línea, en el formulario que
// corresponda, porque ahí sí importa el contexto exacto del campo.
function isRetryableNetworkError(error: AxiosError): boolean {
  if (error.code === 'ECONNABORTED') return true;
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') return true;
  const status = error.response?.status;
  return !!status && status >= 500;
}

apiClient.interceptors.response.use(
  (response) => {
    notifyRequestSucceeded(`${response.config.method ?? ''}:${response.config.url ?? ''}`);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && isRetryableNetworkError(error)) {
      const config = error.config;
      const requestKey = requestKeyFor(error);
      pushToast({
        kind: 'error',
        message: extractErrorMessage(error),
        requestKey,
        onRetry: config ? () => apiClient.request(config) : undefined,
      });
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'El servidor está tardando en responder. Revisa tu conexión e intenta de nuevo.';
    }
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar al servidor. Revisa tu conexión a internet.';
    }
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    const status = error.response?.status;
    if (status && status >= 500) return 'Ocurrió un error en el servidor. Intenta de nuevo en unos minutos.';
    if (status === 404) return 'No se encontró la información solicitada.';
    if (status === 401 || status === 403) return 'No tienes permiso para hacer esto. Vuelve a iniciar sesión.';
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}
