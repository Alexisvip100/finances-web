import { apiClient } from './client';
import { CreditCard, CreditCardDetail, BillingCycle, Transaction } from '../types';

export interface CreateCardPayload {
  name: string;
  bank: string;
  last_four: string;
  credit_limit?: string;
  statement_day: number;
  payment_term_days: number;
  color?: string;
  initial_balance?: string;
  initial_due_date?: string;
}

export function fetchCards() {
  return apiClient.get<CreditCard[]>('/cards').then((r) => r.data);
}

export function createCard(payload: CreateCardPayload) {
  return apiClient.post<CreditCard>('/cards', payload).then((r) => r.data);
}

export function fetchCardDetail(id: number) {
  return apiClient.get<CreditCardDetail>(`/cards/${id}`).then((r) => r.data);
}

export function updateCard(
  id: number,
  payload: Partial<{ name: string; bank: string; credit_limit: string; statement_day: number; payment_term_days: number; color: string }>
) {
  return apiClient.patch<CreditCard>(`/cards/${id}`, payload).then((r) => r.data);
}

export function deleteCard(id: number) {
  return apiClient.delete(`/cards/${id}`).then(() => undefined);
}

export function fetchCardCycles(id: number) {
  return apiClient.get<BillingCycle[]>(`/cards/${id}/cycles`).then((r) => r.data);
}

export function fetchCycleTransactions(cardId: number, cycleId: number) {
  return apiClient.get<Transaction[]>(`/cards/${cardId}/cycles/${cycleId}/transactions`).then((r) => r.data);
}
