import type { NavigateFunction } from 'react-router-dom';
import type { CreditCard, DashboardResponse } from '../../../types';

export interface HomePageTypes {
  navigate: NavigateFunction;
  data: DashboardResponse | null;
  cards: CreditCard[];
  error: string | null;
  loadingDashboard: boolean;
  loadingBudget: boolean;
  budgetPercent: number | null;
  refresh: () => void;
}
