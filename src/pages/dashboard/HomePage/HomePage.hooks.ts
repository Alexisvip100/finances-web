import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchDashboardThunk } from '../../../store/slices/dashboardSlice';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchBudgetThunk } from '../../../store/slices/budgetSlice';
import type { HomePageTypes } from './HomePage.types';

export const useHomePage = (): HomePageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((s) => s.dashboard);
  const cards = useAppSelector((s) => s.cards.items);
  const budget = useAppSelector((s) => s.budget);

  const refresh = useCallback(() => {
    dispatch(fetchDashboardThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchBudgetThunk(budget.month));
  }, [dispatch, budget.month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const data = dashboard.data;
  const loadingDashboard = dashboard.status === 'loading' && !data;
  const loadingBudget = budget.status === 'loading' && !budget.data;

  const budgetTotals = budget.data?.categories.reduce(
    (acc, c) => {
      if (c.monthly_limit) {
        acc.limit += Number(c.monthly_limit);
        acc.spent += Number(c.spent);
      }
      return acc;
    },
    { limit: 0, spent: 0 }
  );
  const budgetPercent =
    budgetTotals && budgetTotals.limit > 0 ? Math.round((budgetTotals.spent / budgetTotals.limit) * 100) : null;

  return {
    navigate,
    data,
    cards,
    error: dashboard.error,
    loadingDashboard,
    loadingBudget,
    budgetPercent,
    refresh,
  };
};
