import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardDetailThunk } from '../../../store/slices/cardsSlice';
import { fetchDashboardThunk } from '../../../store/slices/dashboardSlice';
import { extractErrorMessage } from '../../../api/client';
import * as paymentsApi from '../../../api/payments';
import type { PaymentMode, RegisterPaymentPageTypes, SourceSelection } from './RegisterPaymentPage.types';

export const useRegisterPaymentPage = (): RegisterPaymentPageTypes => {
  const navigate = useNavigate();
  const { cardId: cardIdParam } = useParams();
  const cardId = Number(cardIdParam);
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const dashboard = useAppSelector((s) => s.dashboard.data);
  const detail = useAppSelector((s) => s.cards.detailById[cardId]);
  const cardsError = useAppSelector((s) => s.cards.error);

  const [mode, setMode] = useState<PaymentMode>('total');
  const [customAmount, setCustomAmount] = useState('');
  const [source, setSource] = useState<SourceSelection>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCardDetailThunk(cardId));
    dispatch(fetchAccountsThunk());
    dispatch(fetchDashboardThunk());
  }, [cardId, dispatch]);

  const pending = detail?.pending_cycle;
  const cycleId = pending?.id ?? null;
  const remaining = pending ? Number(pending.total_amount) - Number(pending.paid_amount) : 0;
  const allocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;

  useEffect(() => {
    if (!source) {
      if (allocated > 0) setSource({ kind: 'allocation' });
      else if (accounts.length > 0) setSource({ kind: 'account', id: accounts[0].id });
    }
  }, [source, allocated, accounts]);

  const amount = mode === 'total' ? remaining : Number(customAmount) || 0;
  const canSave = amount > 0 && amount <= remaining && source !== null && cycleId !== null;
  const committedAfter = Math.max(0, remaining - amount);

  const handleConfirm = async () => {
    if (!canSave || !source || cycleId === null) return;
    setSaving(true);
    setError(null);
    try {
      await paymentsApi.createPayment(cardId, {
        billing_cycle_id: cycleId,
        amount: String(amount),
        source_type: source.kind === 'allocation' ? 'ALLOCATION' : 'ACCOUNT',
        source_account_id: source.kind === 'account' ? source.id : undefined,
      });
      await dispatch(fetchCardDetailThunk(cardId));
      navigate(-1);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return {
    navigate,
    cardId,
    accounts,
    dashboard,
    detail,
    cardsError,
    pending,
    cycleId,
    remaining,
    allocated,
    mode,
    customAmount,
    source,
    error,
    saving,
    amount,
    canSave,
    committedAfter,
    setMode,
    setCustomAmount,
    setSource,
    handleConfirm,
  };
};
