import type { NavigateFunction } from 'react-router-dom';
import type { Account, BillingCycle, CreditCardDetail, DashboardResponse } from '../../../types';

export interface AllocatePageTypes {
  navigate: NavigateFunction;
  cardId: number;
  accounts: Account[];
  detail: CreditCardDetail | undefined;
  dashboard: DashboardResponse | null;
  cardsError: string | null;
  amount: string;
  accountId: number | null;
  error: string | null;
  saving: boolean;
  pendingCycle: BillingCycle | null | undefined;
  remaining: number;
  alreadyAllocated: number;
  missing: number;
  percent: number;
  nextIncomeBeforeDue: string | null;
  canSave: boolean;
  setAmount: (amount: string) => void;
  setAccountId: (id: number) => void;
  handleAllocate: () => Promise<void>;
  handleWithdraw: () => void;
}
