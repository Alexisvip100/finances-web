import type { NavigateFunction } from 'react-router-dom';
import type { Account, Category, CreditCard, User } from '../../../types';
import type { FixedExpense } from '../../../api/fixedExpenses';
import type { Income } from '../../../api/incomes';
import type { ThemeMode } from '../../../theme/ThemeModeContext';

export interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: string;
}

export interface SettingsPageTypes {
  navigate: NavigateFunction;
  accounts: Account[];
  cards: CreditCard[];
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  categories: Category[];
  user: User | null;
  error: string | null;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  handleLogout: () => void;
  themeOptions: ThemeOption[];
}
