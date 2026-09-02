import type { NavigateFunction } from 'react-router-dom';
import type { Account, BillingCycle, CreditCardDetail, DashboardResponse } from '../../../types';

export type SourceSelection = { kind: 'account'; id: number } | { kind: 'allocation' } | null;
export type PaymentMode = 'total' | 'other';

export interface RegisterPaymentPageTypes {
  navigate: NavigateFunction;
  cardId: number;
  accounts: Account[];
  dashboard: DashboardResponse | null;
  detail: CreditCardDetail | undefined;
  cardsError: string | null;
  pending: BillingCycle | null | undefined;
  cycleId: number | null;
  remaining: number;
  allocated: number;
  mode: PaymentMode;
  customAmount: string;
  source: SourceSelection;
  error: string | null;
  saving: boolean;
  amount: number;
  canSave: boolean;
  committedAfter: number;
  setMode: (mode: PaymentMode) => void;
  setCustomAmount: (amount: string) => void;
  setSource: (source: SourceSelection) => void;
  handleConfirm: () => Promise<void>;
}
