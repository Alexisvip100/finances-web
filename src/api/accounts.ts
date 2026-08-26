import { apiClient } from './client';
import { Account, AccountType } from '../types';

export function fetchAccounts() {
  return apiClient.get<Account[]>('/accounts').then((r) => r.data);
}

export function createAccount(payload: { name: string; type: AccountType; bank?: string; balance?: string; color?: string }) {
  return apiClient.post<Account>('/accounts', payload).then((r) => r.data);
}

export function updateAccount(id: number, payload: Partial<{ name: string; bank: string; balance: string; color: string }>) {
  return apiClient.patch<Account>(`/accounts/${id}`, payload).then((r) => r.data);
}

export function deleteAccount(id: number) {
  return apiClient.delete(`/accounts/${id}`).then(() => undefined);
}
