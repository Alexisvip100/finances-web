import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import * as transactionsApi from '../../../api/transactions';
import { extractErrorMessage } from '../../../api/client';
import { Transaction } from '../../../types';
import { lastDayOfMonth } from '../../../utils/dateHelpers';
import { cardLabel } from '../../../utils/labels';
import type { CategoryTransactionsSheetProps, CategoryTransactionsSheetTypes } from './CategoryTransactionsSheet.types';

export const useCategoryTransactionsSheet = (
  props: CategoryTransactionsSheetProps
): CategoryTransactionsSheetTypes => {
  const { category, categoryId, categoryName, month } = props;
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);

  const [items, setItems] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetCategoryId = category ? category.category_id : categoryId ?? null;
  const effectiveCategoryName = category ? category.category_name : categoryName ?? 'Categoría';

  useEffect(() => {
    dispatch(fetchCardsThunk());
    setItems(null);
    setError(null);
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = lastDayOfMonth(year, monthNum);
    const filters = {
      category_id: targetCategoryId ?? undefined,
      from_date: `${month}-01`,
      to_date: `${month}-${String(lastDay).padStart(2, '0')}`,
    };
    transactionsApi
      .fetchTransactions(filters)
      .then((txns) => setItems(targetCategoryId === null ? txns.filter((t) => t.category_id === null) : txns))
      .catch((e) => setError(extractErrorMessage(e)));
  }, [targetCategoryId, month, dispatch]);

  const sorted = useMemo(
    () => (items ? [...items].sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1)) : []),
    [items]
  );

  const sourceLabel = (t: Transaction) => {
    if (t.credit_card_id) {
      const card = cards.find((c) => c.id === t.credit_card_id);
      return card ? `${cardLabel(card)} ••••${card.last_four}` : 'Tarjeta';
    }
    const account = accounts.find((a) => a.id === t.account_id);
    return account?.name ?? 'Efectivo';
  };

  return {
    items,
    sorted,
    error,
    effectiveCategoryName,
    sourceLabel,
  };
};
