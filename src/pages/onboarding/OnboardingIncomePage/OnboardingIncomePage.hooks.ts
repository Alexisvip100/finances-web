import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createIncomeThunk } from '../../../store/slices/incomesSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { PaymentDay } from '../../../types';
import { PaymentDayState, resolvePaymentDayValue } from '../../../utils/paymentDay';
import type { OnboardingIncomePageTypes } from './OnboardingIncomePage.types';

export const useOnboardingIncomePage = (): OnboardingIncomePageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const error = useAppSelector((s) => s.incomes.error);
  const [amount, setAmount] = useState('');
  const [firstDayState, setFirstDayState] = useState<PaymentDayState>({
    mode: 'day',
    dayText: '15',
    isLastDay: false,
    adjustWeekend: false,
  });
  const [hasSecondPayment, setHasSecondPayment] = useState(true);
  const [secondDayState, setSecondDayState] = useState<PaymentDayState>({
    mode: 'day',
    dayText: '',
    isLastDay: true,
    adjustWeekend: false,
  });
  const [saving, setSaving] = useState(false);

  const firstDayValue = resolvePaymentDayValue(firstDayState);
  const secondDayValue = resolvePaymentDayValue(secondDayState);
  const firstDayValid = firstDayValue !== null;
  const secondDayValid = !hasSecondPayment || secondDayValue !== null;

  const paymentDays: PaymentDay[] =
    firstDayValue !== null
      ? hasSecondPayment && secondDayValue !== null
        ? [firstDayValue, secondDayValue]
        : [firstDayValue]
      : [];
  const frequency = hasSecondPayment ? 'BIWEEKLY' : 'MONTHLY';

  const canFinish = Number(amount) > 0 && accounts.length > 0 && firstDayValid && secondDayValid;

  const finish = async () => {
    setSaving(true);
    try {
      if (canFinish) {
        await dispatch(
          createIncomeThunk({
            name: 'Ingreso principal',
            amount,
            frequency,
            payment_days: paymentDays,
            account_id: accounts[0].id,
          })
        ).unwrap();
      }
      await dispatch(fetchAccountsThunk()).unwrap();
      navigate('/');
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return {
    navigate,
    accounts,
    error,
    amount,
    firstDayState,
    hasSecondPayment,
    secondDayState,
    saving,
    canFinish,
    setAmount,
    setFirstDayState,
    setHasSecondPayment,
    setSecondDayState,
    finish,
    handleSkip,
  };
};
