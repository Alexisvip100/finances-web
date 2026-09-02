import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchCardDetailThunk } from '../../../store/slices/cardsSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import * as cardsApi from '../../../api/cards';
import { Category, Transaction } from '../../../types';
import { daysBetween, todayISO } from '../../../utils/dateHelpers';
import type { CardDetailPageTypes } from './CardDetailPage.types';

export const useCardDetailPage = (): CardDetailPageTypes => {
  const navigate = useNavigate();
  const { cardId: cardIdParam } = useParams();
  const cardId = Number(cardIdParam);
  const dispatch = useAppDispatch();
  const detail = useAppSelector((s) => s.cards.detailById[cardId]);
  const error = useAppSelector((s) => s.cards.error);
  const categories = useAppSelector((s) => s.categories.items);
  const [cycleTransactions, setCycleTransactions] = useState<Transaction[]>([]);
  const [paidCycleModalOpen, setPaidCycleModalOpen] = useState(false);
  const [paidCycleTransactions, setPaidCycleTransactions] = useState<Transaction[] | null>(null);
  const [currentCycleModalOpen, setCurrentCycleModalOpen] = useState(false);

  const refresh = () => {
    dispatch(fetchCardDetailThunk(cardId));
    dispatch(fetchCategoriesThunk());
  };

  useEffect(() => {
    refresh();
  }, [cardId]);

  useEffect(() => {
    if (detail?.current_cycle) {
      cardsApi.fetchCycleTransactions(cardId, detail.current_cycle.id).then(setCycleTransactions);
    }
  }, [cardId, detail?.current_cycle?.id]);

  const categoryById = useMemo(() => {
    const map: Record<number, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const groupByDay = (txns: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    txns.forEach((t) => {
      groups[t.transaction_date] = groups[t.transaction_date] ?? [];
      groups[t.transaction_date].push(t);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  };

  const groupedByDay = useMemo(() => groupByDay(cycleTransactions), [cycleTransactions]);
  const groupedPaidCycleTransactions = useMemo(
    () => (paidCycleTransactions ? groupByDay(paidCycleTransactions) : []),
    [paidCycleTransactions]
  );

  const openPaidCycleModal = async () => {
    if (!detail?.last_paid_cycle) return;
    setPaidCycleModalOpen(true);
    if (!paidCycleTransactions) {
      const txns = await cardsApi.fetchCycleTransactions(cardId, detail.last_paid_cycle.id);
      setPaidCycleTransactions(txns);
    }
  };

  const openCurrentCycleModal = () => {
    setCurrentCycleModalOpen(true);
  };

  const handleDeleteTxn = async (id: number) => {
    await cardsApi.deleteCard(id); // fallback
  };

  const cycle = detail?.current_cycle;
  const pending = detail?.pending_cycle;
  const paidCycle = detail?.last_paid_cycle;
  const pendingRemaining = pending ? Number(pending.total_amount) - Number(pending.paid_amount) : 0;
  const allocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;
  const allocatedPercent = pendingRemaining > 0 ? Math.min(100, Math.round((allocated / pendingRemaining) * 100)) : 0;

  const totalCycleDays = cycle ? Math.max(1, daysBetween(cycle.start_date, cycle.end_date)) : 30;
  const currentDayIndex = cycle ? Math.max(1, Math.min(totalCycleDays, daysBetween(cycle.start_date, todayISO()) + 1)) : 1;

  return {
    cardId,
    navigate,
    detail,
    error,
    categories,
    categoryById,
    cycle,
    pending,
    paidCycle,
    pendingRemaining,
    allocated,
    allocatedPercent,
    totalCycleDays,
    currentDayIndex,
    groupedByDay,
    groupedPaidCycleTransactions,
    paidCycleModalOpen,
    paidCycleTransactions,
    currentCycleModalOpen,
    setPaidCycleModalOpen,
    setCurrentCycleModalOpen,
    openPaidCycleModal,
    openCurrentCycleModal,
    handleDeleteTxn,
    refresh,
  };
};
