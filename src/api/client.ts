import axios from 'axios';
import { API_BASE_URL } from '../config';

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

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (error.message === 'Network Error') {
      return 'No se pudo conectar al servidor. Revisa tu conexión a internet.';
    }
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}
