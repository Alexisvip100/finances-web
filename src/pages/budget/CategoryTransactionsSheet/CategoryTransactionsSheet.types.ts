import type { CategoryBudget, Transaction } from '../../../types';

export interface CategoryTransactionsSheetProps {
  category?: CategoryBudget | null;
  categoryId?: number | null;
  categoryName?: string;
  month: string;
  onClose: () => void;
}

export interface CategoryTransactionsSheetTypes {
  items: Transaction[] | null;
  sorted: Transaction[];
  error: string | null;
  effectiveCategoryName: string;
  sourceLabel: (t: Transaction) => string;
}
