import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { deleteIncomeReceiptThunk, fetchIncomesThunk, receiveIncomeThunk } from '../../../store/slices/incomesSlice';
import * as incomesApi from '../../../api/incomes';
import { lastDayOfMonth, shiftMonthKey, todayISO } from '../../../utils/dateHelpers';
import type { IncomeHistoryPageTypes } from './IncomeHistoryPage.types';

export const useIncomeHistoryPage = (): IncomeHistoryPageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const incomes = useAppSelector((s) => s.incomes.items);
  const error = useAppSelector((s) => s.incomes.error);

  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [incomeFilter, setIncomeFilter] = useState<number | null>(null);
  const [receipts, setReceipts] = useState<incomesApi.IncomeReceipt[] | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [paidIncomeIds, setPaidIncomeIds] = useState<Set<number>>(new Set());
  const [deletingReceiptId, setDeletingReceiptId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchIncomesThunk());
  }, [dispatch]);

  const monthBounds = useCallback(() => {
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = lastDayOfMonth(year, monthNum);
    return { from_date: `${month}-01`, to_date: `${month}-${String(lastDay).padStart(2, '0')}` };
  }, [month]);

  const refresh = useCallback(async () => {
    const res = await incomesApi.fetchIncomeReceipts({ ...monthBounds(), income_id: incomeFilter ?? undefined });
    setReceipts(res);
  }, [monthBounds, incomeFilter]);

  const refreshPaidStatus = useCallback(() => {
    const currentMonth = todayISO().slice(0, 7);
    const [year, monthNum] = currentMonth.split('-').map(Number);
    const lastDay = lastDayOfMonth(year, monthNum);
    return incomesApi
      .fetchIncomeReceipts({ from_date: `${currentMonth}-01`, to_date: `${currentMonth}-${String(lastDay).padStart(2, '0')}` })
      .then((r) => setPaidIncomeIds(new Set(r.map((receipt) => receipt.income_id))));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refreshPaidStatus();
  }, [refreshPaidStatus]);

  const handleMarkPaid = async (incomeId: number) => {
    setMarkingId(incomeId);
    try {
      await dispatch(receiveIncomeThunk({ id: incomeId })).unwrap();
      refresh();
      refreshPaidStatus();
    } catch {
      // el error ya se muestra desde el banner de arriba
    } finally {
      setMarkingId(null);
    }
  };

  const handleDeleteReceipt = async (receiptId: number) => {
    setDeletingReceiptId(receiptId);
    try {
      await dispatch(deleteIncomeReceiptThunk(receiptId)).unwrap();
      refresh();
      refreshPaidStatus();
    } catch {
      // el error ya se muestra desde el banner de arriba
    } finally {
      setDeletingReceiptId(null);
    }
  };

  const incomeById = useMemo(() => {
    const map: Record<number, (typeof incomes)[number]> = {};
    incomes.forEach((i) => (map[i.id] = i));
    return map;
  }, [incomes]);

  const activeIncomes = useMemo(() => incomes.filter((i) => i.is_active), [incomes]);

  const total = useMemo(() => (receipts ?? []).reduce((sum, r) => sum + Number(r.amount), 0), [receipts]);

  const groupedByDay = useMemo(() => {
    const groups: Record<string, incomesApi.IncomeReceipt[]> = {};
    (receipts ?? []).forEach((r) => {
      groups[r.received_date] = groups[r.received_date] ?? [];
      groups[r.received_date].push(r);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [receipts]);

  const changeMonth = (delta: number) => setMonth((m) => shiftMonthKey(m, delta));

  return {
    navigate,
    incomes,
    activeIncomes,
    incomeById,
    error,
    month,
    incomeFilter,
    receipts,
    total,
    groupedByDay,
    markingId,
    paidIncomeIds,
    deletingReceiptId,
    setIncomeFilter,
    changeMonth,
    handleMarkPaid,
    handleDeleteReceipt,
    refresh,
  };
};
