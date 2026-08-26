import { apiClient } from './client';
import { IncomeFrequency, PaymentDay } from '../types';

export interface Income {
  id: number;
  name: string;
  amount: string;
  frequency: IncomeFrequency;
  payment_days: PaymentDay[];
  account_id: number;
  is_active: boolean;
}

export interface CreateIncomePayload {
  name: string;
  amount: string;
  frequency: IncomeFrequency;
  payment_days: PaymentDay[];
  account_id: number;
  is_active?: boolean;
}

export function fetchIncomes() {
  return apiClient.get<Income[]>('/incomes').then((r) => r.data);
}

export function createIncome(payload: CreateIncomePayload) {
  return apiClient.post<Income>('/incomes', payload).then((r) => r.data);
}

export function updateIncome(id: number, payload: Partial<CreateIncomePayload>) {
  return apiClient.patch<Income>(`/incomes/${id}`, payload).then((r) => r.data);
}

export function deleteIncome(id: number) {
  return apiClient.delete(`/incomes/${id}`).then(() => undefined);
}

export interface IncomeReceipt {
  id: number;
  income_id: number;
  account_id: number;
  amount: string;
  received_date: string;
}

export function receiveIncome(id: number, payload?: { received_date?: string; amount?: string }) {
  return apiClient.post<IncomeReceipt>(`/incomes/${id}/receive`, payload ?? {}).then((r) => r.data);
}

export function fetchIncomeReceipts(params?: { from_date?: string; to_date?: string; income_id?: number }) {
  return apiClient.get<IncomeReceipt[]>('/incomes/receipts', { params }).then((r) => r.data);
}

export function deleteIncomeReceipt(id: number) {
  return apiClient.delete(`/incomes/receipts/${id}`).then(() => undefined);
}
