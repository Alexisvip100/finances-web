import { apiClient } from './client';
import { Category } from '../types';

export function fetchCategories() {
  return apiClient.get<Category[]>('/categories').then((r) => r.data);
}

export function createCategory(payload: { name: string; icon?: string; color?: string; monthly_limit?: string }) {
  return apiClient.post<Category>('/categories', payload).then((r) => r.data);
}

export function updateCategory(id: number, payload: Partial<{ name: string; monthly_limit: string }>) {
  return apiClient.patch<Category>(`/categories/${id}`, payload).then((r) => r.data);
}

export function deleteCategory(id: number) {
  return apiClient.delete(`/categories/${id}`).then(() => undefined);
}
