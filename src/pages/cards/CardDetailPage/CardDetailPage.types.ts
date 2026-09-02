import type { NavigateFunction } from 'react-router-dom';
import type { BillingCycle, Category, CreditCardDetail, Transaction } from '../../../types';

export interface CardDetailPageTypes {
  cardId: number;
  navigate: NavigateFunction;
  detail: CreditCardDetail | undefined;
  error: string | null;
  categories: Category[];
  categoryById: Record<number, Category>;
  cycle: BillingCycle | null | undefined;
  pending: BillingCycle | null | undefined;
  paidCycle: BillingCycle | null | undefined;
  pendingRemaining: number;
  allocated: number;
  allocatedPercent: number;
  totalCycleDays: number;
  currentDayIndex: number;
  groupedByDay: [string, Transaction[]][];
  groupedPaidCycleTransactions: [string, Transaction[]][];
  paidCycleModalOpen: boolean;
  paidCycleTransactions: Transaction[] | null;
  currentCycleModalOpen: boolean;
  setPaidCycleModalOpen: (open: boolean) => void;
  setCurrentCycleModalOpen: (open: boolean) => void;
  openPaidCycleModal: () => Promise<void>;
  openCurrentCycleModal: () => void;
  handleDeleteTxn: (id: number) => Promise<void>;
  refresh: () => void;
}
