import type { NavigateFunction } from 'react-router-dom';
import type { Account, AccountType } from '../../../types';

export interface AccountFormPageTypes {
  navigate: NavigateFunction;
  isEditing: boolean;
  existing: Account | undefined;
  error: string | null;
  name: string;
  type: AccountType;
  bank: string;
  balance: string;
  saving: boolean;
  deleting: boolean;
  canSave: boolean;
  setName: (name: string) => void;
  setBank: (bank: string) => void;
  setBalance: (balance: string) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
}
