import type { NavigateFunction } from 'react-router-dom';
import type { Income, IncomeReceipt } from '../../../api/incomes';

export interface IncomeHistoryPageTypes {
  navigate: NavigateFunction;
  incomes: Income[];
  activeIncomes: Income[];
  incomeById: Record<number, Income>;
  error: string | null;
  month: string;
  incomeFilter: number | null;
  receipts: IncomeReceipt[] | null;
  total: number;
  groupedByDay: [string, IncomeReceipt[]][];
  markingId: number | null;
  paidIncomeIds: Set<number>;
  deletingReceiptId: number | null;
  setIncomeFilter: (id: number | null) => void;
  changeMonth: (delta: number) => void;
  handleMarkPaid: (incomeId: number) => Promise<void>;
  handleDeleteReceipt: (receiptId: number) => Promise<void>;
  refresh: () => Promise<void>;
}
