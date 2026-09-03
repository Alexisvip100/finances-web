import type { NavigateFunction } from 'react-router-dom';
import type { Account, Category, CreditCard, PaymentMethod, Transaction } from '../../../types';
import type { FixedExpense } from '../../../api/fixedExpenses';

export type SourceFilter = { kind: 'account' | 'card'; id: number } | null;
export type Granularity = 'month' | 'week' | 'day';

export interface MethodOption {
  value: PaymentMethod | null;
  label: string;
}

export interface TransactionHistoryPageTypes {
  navigate: NavigateFunction;
  items: Transaction[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  categories: Category[];
  accounts: Account[];
  cards: CreditCard[];
  fixedExpenses: FixedExpense[];
  activeFixedExpenses: FixedExpense[];
  granularity: Granularity;
  anchorDate: string;
  month: string;
  categoryId: number | null;
  categoryPickerOpen: boolean;
  source: SourceFilter;
  method: PaymentMethod | null;
  onlyFixed: boolean;
  paidFixedIds: Set<number>;
  markingPaidId: number | null;
  categoryById: Record<number, Category>;
  selectedCategory: Category | undefined;
  debitAccounts: Account[];
  sourceLabel: (t: Transaction) => string;
  total: number;
  groupedByDay: [string, Transaction[]][];
  periodLabel: string;
  hasActiveFilters: boolean;
  methodOptions: MethodOption[];
  setGranularity: (g: Granularity) => void;
  setCategoryId: (id: number | null) => void;
  setCategoryPickerOpen: (open: boolean) => void;
  setSource: (source: SourceFilter) => void;
  setOnlyFixed: (only: boolean | ((prev: boolean) => boolean)) => void;
  handleMethodChange: (m: PaymentMethod | null) => void;
  changePeriod: (delta: number) => void;
  handleMarkPaid: (fixed: FixedExpense) => Promise<void>;
  handleDeleteTxn: (id: number) => Promise<void>;
  refresh: () => void;
  payingFixedExpense: FixedExpense | null;
  selectedPaySource: { kind: 'account' | 'card'; id: number } | null;
  isPaying: boolean;
  openPayModal: (fixed: FixedExpense) => void;
  closePayModal: () => void;
  setSelectedPaySource: (source: { kind: 'account' | 'card'; id: number } | null) => void;
  confirmPayFixed: () => Promise<void>;
}
