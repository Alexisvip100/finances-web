import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createIncomeThunk, deleteIncomeThunk, updateIncomeThunk } from '../../../store/slices/incomesSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { PaymentDay } from '../../../types';
import { decodePaymentDayToState, PaymentDayState, resolvePaymentDayValue } from '../../../utils/paymentDay';
import type { IncomeFormPageTypes } from './IncomeFormPage.types';

export const useIncomeFormPage = (): IncomeFormPageTypes => {
  const navigate = useNavigate();
  const { incomeId } = useParams();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const error = useAppSelector((s) => s.incomes.error);
  const existing = useAppSelector((s) => s.incomes.items.find((i) => i.id === Number(incomeId)));
  const isEditing = existing !== undefined;

  const [amount, setAmount] = useState(existing?.amount ?? '');
  const [firstDayState, setFirstDayState] = useState<PaymentDayState>(
    decodePaymentDayToState(existing?.payment_days[0])
  );
  const [hasSecondPayment, setHasSecondPayment] = useState((existing?.payment_days.length ?? 0) > 1);
  const [secondDayState, setSecondDayState] = useState<PaymentDayState>(
    existing?.payment_days[1] !== undefined
      ? decodePaymentDayToState(existing.payment_days[1])
      : { mode: 'day', dayText: '', isLastDay: true, adjustWeekend: false }
  );
  const [accountId, setAccountId] = useState<number | null>(existing?.account_id ?? accounts[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const name = existing?.name ?? 'Ingreso';

  useEffect(() => {
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (accountId === null && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

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

  const canSave = Number(amount) > 0 && accountId !== null && firstDayValid && secondDayValid;

  const handleSave = async () => {
    if (!canSave || !accountId) return;
    setSaving(true);
    try {
      if (isEditing) {
        await dispatch(
          updateIncomeThunk({ id: existing.id, payload: { name, amount, frequency, payment_days: paymentDays } })
        ).unwrap();
      } else {
        await dispatch(
          createIncomeThunk({ name, amount, frequency, payment_days: paymentDays, account_id: accountId })
        ).unwrap();
      }
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setDeleting(true);
    try {
      await dispatch(deleteIncomeThunk(existing.id)).unwrap();
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setDeleting(false);
    }
  };

  return {
    navigate,
    isEditing,
    existing,
    accounts,
    error,
    amount,
    firstDayState,
    hasSecondPayment,
    secondDayState,
    accountId,
    saving,
    deleting,
    canSave,
    setAmount,
    setFirstDayState,
    setHasSecondPayment,
    setSecondDayState,
    setAccountId,
    handleSave,
    handleDelete,
  };
};
