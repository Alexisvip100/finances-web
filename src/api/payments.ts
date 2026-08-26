import { apiClient } from './client';
import { Payment, PaymentSourceType, SavingsAllocation } from '../types';

export function createPayment(
  cardId: number,
  payload: { billing_cycle_id: number; amount: string; source_type: PaymentSourceType; source_account_id?: number }
) {
  return apiClient.post<Payment>(`/cards/${cardId}/payments`, payload).then((r) => r.data);
}

export function createAllocation(
  cardId: number,
  payload: { billing_cycle_id: number; amount: string; source_account_id: number }
) {
  return apiClient.post<SavingsAllocation>(`/cards/${cardId}/allocations`, payload).then((r) => r.data);
}

export function deleteAllocation(id: number) {
  return apiClient.delete(`/allocations/${id}`).then(() => undefined);
}
