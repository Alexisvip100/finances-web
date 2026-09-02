import type { NavigateFunction } from 'react-router-dom';
import type { Account, CreditCard, CreditCardDetail } from '../../../types';

export interface CardsTotals {
  committed: number;
  allocated: number;
}

export interface CardsListPageTypes {
  navigate: NavigateFunction;
  items: CreditCard[];
  detailById: Record<number, CreditCardDetail>;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  debitCards: Account[];
  totals: CardsTotals;
  refresh: () => void;
}
