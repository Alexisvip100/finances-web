import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardDetailThunk } from '../../../store/slices/cardsSlice';
import { fetchDashboardThunk } from '../../../store/slices/dashboardSlice';
import { extractErrorMessage } from '../../../api/client';
import * as paymentsApi from '../../../api/payments';
import type { AllocatePageTypes } from './AllocatePage.types';

export const useAllocatePage = (): AllocatePageTypes => {
  const navigate = useNavigate();
  const { cardId: cardIdParam } = useParams();
  const cardId = Number(cardIdParam);
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const detail = useAppSelector((s) => s.cards.detailById[cardId]);
  const dashboard = useAppSelector((s) => s.dashboard.data);
  const cardsError = useAppSelector((s) => s.cards.error);

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCardDetailThunk(cardId));
    dispatch(fetchAccountsThunk());
    dispatch(fetchDashboardThunk());
  }, [cardId, dispatch]);

  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accountId, accounts]);

  const pendingCycle = detail?.pending_cycle;
  const cycleId = pendingCycle?.id ?? null;
  const remaining = pendingCycle ? Number(pendingCycle.total_amount) - Number(pendingCycle.paid_amount) : 0;
  const alreadyAllocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;
  const missing = Math.max(0, remaining - alreadyAllocated);
  const percent = remaining > 0 ? Math.min(100, Math.round((alreadyAllocated / remaining) * 100)) : 0;

  const nextIncomeBeforeDue =
    dashboard?.next_income_date && pendingCycle && dashboard.next_income_date < pendingCycle.due_date
      ? dashboard.next_income_date
      : null;

  const canSave = Number(amount) > 0 && accountId !== null && cycleId !== null;

  const handleAllocate = async () => {
    if (!canSave || !accountId || cycleId === null) return;
    setSaving(true);
    setError(null);
    try {
      await paymentsApi.createAllocation(cardId, {
        billing_cycle_id: cycleId,
        amount,
        source_account_id: accountId,
      });
      await dispatch(fetchCardDetailThunk(cardId));
      navigate(-1);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = () => {
    navigate(-1);
  };

  return {
    navigate,
    cardId,
    accounts,
    detail,
    dashboard,
    cardsError,
    amount,
    accountId,
    error,
    saving,
    pendingCycle,
    remaining,
    alreadyAllocated,
    missing,
    percent,
    nextIncomeBeforeDue,
    canSave,
    setAmount,
    setAccountId,
    handleAllocate,
    handleWithdraw,
  };
};
