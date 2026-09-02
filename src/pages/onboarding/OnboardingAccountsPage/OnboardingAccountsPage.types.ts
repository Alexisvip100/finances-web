import type { NavigateFunction } from 'react-router-dom';

export interface DraftDebitAccount {
  key: string;
  name: string;
  balance: string;
}

export interface OnboardingAccountsPageTypes {
  navigate: NavigateFunction;
  cashBalance: string;
  debitAccounts: DraftDebitAccount[];
  saving: boolean;
  error: string | null;
  setCashBalance: (balance: string) => void;
  updateDebit: (key: string, patch: Partial<DraftDebitAccount>) => void;
  addDebit: () => void;
  handleNext: () => Promise<void>;
  handleSkip: () => void;
}
