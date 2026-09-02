import type { NavigateFunction } from 'react-router-dom';
import type { Account, Category, CreditCard } from '../../../types';
import type { FixedExpense } from '../../../api/fixedExpenses';

export type SourceSelection = { kind: 'account'; id: number } | { kind: 'card'; id: number } | null;

export interface FixedExpenseFormPageTypes {
  navigate: NavigateFunction;
  isEditing: boolean;
  existing: FixedExpense | undefined;
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
  error: string | null;
  name: string;
  amount: string;
  dayOfMonth: string;
  categoryId: number | null;
  source: SourceSelection;
  saving: boolean;
  deleting: boolean;
  canSave: boolean;
  setName: (name: string) => void;
  setAmount: (amount: string) => void;
  setDayOfMonth: (day: string) => void;
  setCategoryId: (id: number) => void;
  setSource: (source: SourceSelection) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
}
