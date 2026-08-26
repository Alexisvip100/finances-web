import { apiClient } from './client';
import { User } from '../types';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function register(email: string, password: string) {
  return apiClient.post<TokenResponse>('/auth/register', { email, password }).then((r) => r.data);
}

export function login(email: string, password: string) {
  return apiClient.post<TokenResponse>('/auth/login', { email, password }).then((r) => r.data);
}

export function fetchMe() {
  return apiClient.get<User>('/auth/me').then((r) => r.data);
}

export function updateMe(payload: { monthly_spending_goal: string | null }) {
  return apiClient.patch<User>('/auth/me', payload).then((r) => r.data);
}
