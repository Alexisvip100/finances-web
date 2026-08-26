import { apiClient } from './client';
import { Transaction } from '../types';

export interface FixedExpense {
  id: number;
  name: string;
  amount: string;
  day_of_month: number;
  category_id: number;
  account_id: number | null;
  credit_card_id: number | null;
  is_active: boolean;
}

export interface CreateFixedExpensePayload {
  name: string;
  amount: string;
  day_of_month: number;
  category_id: number;
  account_id?: number;
  credit_card_id?: number;
  is_active?: boolean;
}

export function fetchFixedExpenses() {
  return apiClient.get<FixedExpense[]>('/fixed-expenses').then((r) => r.data);
}

export function createFixedExpense(payload: CreateFixedExpensePayload) {
  return apiClient.post<FixedExpense>('/fixed-expenses', payload).then((r) => r.data);
}

export function updateFixedExpense(id: number, payload: Partial<CreateFixedExpensePayload>) {
  return apiClient.patch<FixedExpense>(`/fixed-expenses/${id}`, payload).then((r) => r.data);
}

export function deleteFixedExpense(id: number) {
  return apiClient.delete(`/fixed-expenses/${id}`).then(() => undefined);
}

export function payFixedExpense(id: number, transactionDate?: string) {
  return apiClient
    .post<Transaction>(`/fixed-expenses/${id}/pay`, transactionDate ? { transaction_date: transactionDate } : {})
    .then((r) => r.data);
}
