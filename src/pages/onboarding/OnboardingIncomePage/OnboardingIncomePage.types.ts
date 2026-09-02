import type { NavigateFunction } from 'react-router-dom';
import type { Account } from '../../../types';
import type { PaymentDayState } from '../../../utils/paymentDay';

export interface OnboardingIncomePageTypes {
  navigate: NavigateFunction;
  accounts: Account[];
  error: string | null;
  amount: string;
  firstDayState: PaymentDayState;
  hasSecondPayment: boolean;
  secondDayState: PaymentDayState;
  saving: boolean;
  canFinish: boolean;
  setAmount: (amount: string) => void;
  setFirstDayState: (state: PaymentDayState) => void;
  setHasSecondPayment: (hasSecond: boolean) => void;
  setSecondDayState: (state: PaymentDayState) => void;
  finish: () => Promise<void>;
  handleSkip: () => void;
}
