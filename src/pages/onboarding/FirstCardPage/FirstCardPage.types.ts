import type { NavigateFunction } from 'react-router-dom';
import type { CycleBoundsPreview } from '../../../utils/cycleHelpers';

export interface FirstCardPageTypes {
  navigate: NavigateFunction;
  name: string;
  bank: string;
  lastFour: string;
  creditLimit: string;
  statementDay: string;
  paymentTermDays: string;
  color: string;
  saving: boolean;
  error: string | null;
  preview: CycleBoundsPreview | null;
  canSave: boolean;
  setName: (name: string) => void;
  setBank: (bank: string) => void;
  setLastFour: (lastFour: string) => void;
  setCreditLimit: (limit: string) => void;
  setStatementDay: (day: string) => void;
  setPaymentTermDays: (days: string) => void;
  setColor: (color: string) => void;
  handleNext: () => Promise<void>;
  handleSkip: () => void;
}
