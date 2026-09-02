import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchCardDetailThunk, fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import type { CardsListPageTypes, CardsTotals } from './CardsListPage.types';

export const useCardsListPage = (): CardsListPageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, detailById, status, error } = useAppSelector((s) => s.cards);
  const accounts = useAppSelector((s) => s.accounts.items);
  const debitCards = useMemo(() => accounts.filter((a) => a.type === 'DEBIT'), [accounts]);

  const refresh = () => {
    dispatch(fetchCardsThunk());
    dispatch(fetchAccountsThunk());
  };

  useEffect(() => {
    refresh();
  }, [dispatch]);

  useEffect(() => {
    items.forEach((c) => dispatch(fetchCardDetailThunk(c.id)));
  }, [items, dispatch]);

  const totals: CardsTotals = useMemo(() => {
    let committed = 0;
    let allocated = 0;
    items.forEach((c) => {
      const detail = detailById[c.id];
      if (detail?.pending_cycle) {
        committed += Number(detail.pending_cycle.total_amount) - Number(detail.pending_cycle.paid_amount);
      }
      if (detail) allocated += Number(detail.allocated_for_pending_cycle);
    });
    return { committed, allocated };
  }, [items, detailById]);

  return {
    navigate,
    items,
    detailById,
    status,
    error,
    debitCards,
    totals,
    refresh,
  };
};
