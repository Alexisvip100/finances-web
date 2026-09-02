import type { NavigateFunction } from 'react-router-dom';
import type { CycleBoundsPreview } from '../../../utils/cycleHelpers';

export type CardKind = 'DEBIT' | 'CREDIT';

export interface CardFormPageTypes {
  navigate: NavigateFunction;
  isEdit: boolean;
  cardId: number | null;
  kind: CardKind;
  name: string;
  bank: string;
  lastFour: string;
  creditLimit: string;
  statementDay: string;
  paymentTermDays: string;
  color: string;
  hasExistingDebt: boolean;
  initialBalance: string;
  initialDueDate: string;
  debitBalance: string;
  saving: boolean;
  cardsError: string | null;
  accountsError: string | null;
  preview: CycleBoundsPreview | null;
  canSave: boolean;
  setKind: (kind: CardKind) => void;
  setName: (name: string) => void;
  setBank: (bank: string) => void;
  setLastFour: (lastFour: string) => void;
  setCreditLimit: (creditLimit: string) => void;
  setStatementDay: (statementDay: string) => void;
  setPaymentTermDays: (paymentTermDays: string) => void;
  setColor: (color: string) => void;
  setHasExistingDebt: (hasDebt: boolean | ((prev: boolean) => boolean)) => void;
  setInitialBalance: (initialBalance: string) => void;
  setInitialDueDate: (initialDueDate: string) => void;
  setDebitBalance: (debitBalance: string) => void;
  handleSave: () => Promise<void>;
}
