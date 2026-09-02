import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createAccountThunk } from '../../../store/slices/accountsSlice';
import type { DraftDebitAccount, OnboardingAccountsPageTypes } from './OnboardingAccountsPage.types';

export const useOnboardingAccountsPage = (): OnboardingAccountsPageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.accounts);
  const [cashBalance, setCashBalance] = useState('');
  const [debitAccounts, setDebitAccounts] = useState<DraftDebitAccount[]>([
    { key: 'debit-1', name: '', balance: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const updateDebit = (key: string, patch: Partial<DraftDebitAccount>) => {
    setDebitAccounts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const addDebit = () => {
    setDebitAccounts((prev) => [...prev, { key: `debit-${prev.length + 1}-${Date.now()}`, name: '', balance: '' }]);
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (Number(cashBalance) > 0 || cashBalance !== '') {
        await dispatch(
          createAccountThunk({ name: 'Efectivo', type: 'CASH', balance: cashBalance || '0' })
        ).unwrap();
      }
      for (const debit of debitAccounts) {
        if (debit.name.trim()) {
          await dispatch(
            createAccountThunk({ name: debit.name.trim(), type: 'DEBIT', balance: debit.balance || '0' })
          ).unwrap();
        }
      }
      navigate('/onboarding/primera-tarjeta');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/primera-tarjeta');
  };

  return {
    navigate,
    cashBalance,
    debitAccounts,
    saving,
    error,
    setCashBalance,
    updateDebit,
    addDebit,
    handleNext,
    handleSkip,
  };
};
