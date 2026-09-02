import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchIncomesThunk } from '../../../store/slices/incomesSlice';
import { fetchFixedExpensesThunk } from '../../../store/slices/fixedExpensesSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import { logoutThunk } from '../../../store/slices/authSlice';
import { useThemeMode } from '../../../theme/ThemeModeContext';
import type { SettingsPageTypes, ThemeOption } from './SettingsPage.types';

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', label: 'Automático', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
];

export const useSettingsPage = (): SettingsPageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts);
  const cards = useAppSelector((s) => s.cards);
  const incomes = useAppSelector((s) => s.incomes);
  const fixedExpenses = useAppSelector((s) => s.fixedExpenses);
  const categories = useAppSelector((s) => s.categories);
  const user = useAppSelector((s) => s.auth.user);
  const { mode, setMode } = useThemeMode();

  useEffect(() => {
    dispatch(fetchAccountsThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchIncomesThunk());
    dispatch(fetchFixedExpensesThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  return {
    navigate,
    accounts: accounts.items,
    cards: cards.items,
    incomes: incomes.items,
    fixedExpenses: fixedExpenses.items,
    categories: categories.items,
    user,
    error: accounts.error || cards.error || incomes.error,
    mode,
    setMode,
    handleLogout,
    themeOptions: THEME_OPTIONS,
  };
};
