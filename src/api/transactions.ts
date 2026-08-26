import { apiClient } from './client';
import { PaymentMethod, Transaction } from '../types';

export interface CreateTransactionPayload {
  amount: string;
  category_id?: number;
  description: string;
  transaction_date: string;
  payment_method: PaymentMethod;
  account_id?: number;
  credit_card_id?: number;
  installment_months?: number;
}

export interface TransactionFilters {
  category_id?: number;
  from_date?: string;
  to_date?: string;
  payment_method?: PaymentMethod;
  account_id?: number;
  credit_card_id?: number;
  fixed_expense_id?: number;
  only_fixed_expenses?: boolean;
}

export function fetchTransactions(params?: TransactionFilters) {
  return apiClient.get<Transaction[]>('/transactions', { params }).then((r) => r.data);
}

export function createTransaction(payload: CreateTransactionPayload) {
  return apiClient.post<Transaction>('/transactions', payload).then((r) => r.data);
}

export function deleteTransaction(id: number) {
  return apiClient.delete(`/transactions/${id}`).then(() => undefined);
}
