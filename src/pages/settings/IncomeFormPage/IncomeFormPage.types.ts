import type { NavigateFunction } from 'react-router-dom';
import type { Account } from '../../../types';
import type { Income } from '../../../api/incomes';
import type { PaymentDayState } from '../../../utils/paymentDay';

export interface IncomeFormPageTypes {
  navigate: NavigateFunction;
  isEditing: boolean;
  existing: Income | undefined;
  accounts: Account[];
  error: string | null;
  amount: string;
  firstDayState: PaymentDayState;
  hasSecondPayment: boolean;
  secondDayState: PaymentDayState;
  accountId: number | null;
  saving: boolean;
  deleting: boolean;
  canSave: boolean;
  setAmount: (amount: string) => void;
  setFirstDayState: (state: PaymentDayState) => void;
  setHasSecondPayment: (hasSecond: boolean) => void;
  setSecondDayState: (state: PaymentDayState) => void;
  setAccountId: (id: number) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
}
