import { apiClient } from './client';
import { BudgetResponse, DashboardResponse, FlowResponse } from '../types';

export function fetchDashboard() {
  return apiClient.get<DashboardResponse>('/dashboard').then((r) => r.data);
}

export function fetchFlow(days: 30 | 60 | 90) {
  return apiClient.get<FlowResponse>('/flow', { params: { days } }).then((r) => r.data);
}

export function fetchBudget(month: string) {
  return apiClient.get<BudgetResponse>('/budget', { params: { month } }).then((r) => r.data);
}
