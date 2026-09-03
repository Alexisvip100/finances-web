import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  deleteTransactionThunk,
  fetchTransactionsThunk,
  payFixedExpenseThunk,
} from '../../../store/slices/transactionsSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchFixedExpensesThunk } from '../../../store/slices/fixedExpensesSlice';
import * as transactionsApi from '../../../api/transactions';
import { PaymentMethod, Transaction } from '../../../types';
import type { FixedExpense } from '../../../api/fixedExpenses';
import {
  endOfWeek,
  formatRangeShort,
  formatWeekdayShort,
  lastDayOfMonth,
  monthKeyLabel,
  shiftDate,
  shiftMonthKey,
  startOfWeek,
  todayISO,
} from '../../../utils/dateHelpers';
import { cardLabel } from '../../../utils/labels';
import { pushToast } from '../../../notifications/toastBus';
import { formatMoney } from '../../../utils/currency';
import type {
  Granularity,
  MethodOption,
  SourceFilter,
  TransactionHistoryPageTypes,
} from './TransactionHistoryPage.types';

const METHOD_OPTIONS: MethodOption[] = [
  { value: null, label: 'Todos' },
  { value: 'CASH', label: 'Efectivo' },
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
];

export const useTransactionHistoryPage = (): TransactionHistoryPageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.transactions);
  const categories = useAppSelector((s) => s.categories.items);
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);
  const fixedExpenses = useAppSelector((s) => s.fixedExpenses.items);

  const [granularity, setGranularity] = useState<Granularity>('month');
  const [anchorDate, setAnchorDate] = useState(todayISO());
  const month = anchorDate.slice(0, 7);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [source, setSource] = useState<SourceFilter>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [onlyFixed, setOnlyFixed] = useState(false);
  const [paidFixedIds, setPaidFixedIds] = useState<Set<number>>(new Set());
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);
  const [payingFixedExpense, setPayingFixedExpense] = useState<FixedExpense | null>(null);
  const [selectedPaySource, setSelectedPaySource] = useState<{ kind: 'account' | 'card'; id: number } | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchAccountsThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchFixedExpensesThunk());
  }, [dispatch]);

  const monthBounds = useCallback(() => {
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = lastDayOfMonth(year, monthNum);
    return { from_date: `${month}-01`, to_date: `${month}-${String(lastDay).padStart(2, '0')}` };
  }, [month]);

  const periodBounds = useCallback(() => {
    if (granularity === 'day') return { from_date: anchorDate, to_date: anchorDate };
    if (granularity === 'week') return { from_date: startOfWeek(anchorDate), to_date: endOfWeek(anchorDate) };
    return monthBounds();
  }, [granularity, anchorDate, monthBounds]);

  const refresh = useCallback(() => {
    dispatch(
      fetchTransactionsThunk({
        ...periodBounds(),
        category_id: categoryId ?? undefined,
        account_id: source?.kind === 'account' ? source.id : undefined,
        credit_card_id: source?.kind === 'card' ? source.id : undefined,
        payment_method: method ?? undefined,
        only_fixed_expenses: onlyFixed || undefined,
      })
    );
  }, [dispatch, periodBounds, categoryId, source, method, onlyFixed]);

  const refreshFixedStatus = useCallback(() => {
    transactionsApi
      .fetchTransactions({ ...monthBounds(), only_fixed_expenses: true })
      .then((txns) =>
        setPaidFixedIds(new Set(txns.map((t) => t.fixed_expense_id).filter((id): id is number => id !== null)))
      );
  }, [monthBounds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refreshFixedStatus();
  }, [refreshFixedStatus]);

  const resolveDateInViewedMonth = (dayOfMonth: number) => {
    const [year, monthNum] = month.split('-').map(Number);
    const day = Math.min(dayOfMonth, lastDayOfMonth(year, monthNum));
    return `${month}-${String(day).padStart(2, '0')}`;
  };

  const openPayModal = (fixed: FixedExpense) => {
    setPayingFixedExpense(fixed);
    if (fixed.credit_card_id) {
      setSelectedPaySource({ kind: 'card', id: fixed.credit_card_id });
    } else if (fixed.account_id) {
      setSelectedPaySource({ kind: 'account', id: fixed.account_id });
    } else if (accounts.length > 0) {
      setSelectedPaySource({ kind: 'account', id: accounts[0].id });
    } else if (cards.length > 0) {
      setSelectedPaySource({ kind: 'card', id: cards[0].id });
    } else {
      setSelectedPaySource(null);
    }
  };

  const closePayModal = () => {
    if (isPaying) return;
    setPayingFixedExpense(null);
  };

  const confirmPayFixed = async () => {
    if (!payingFixedExpense || !selectedPaySource) return;
    setIsPaying(true);
    try {
      await dispatch(
        payFixedExpenseThunk({
          id: payingFixedExpense.id,
          transactionDate: resolveDateInViewedMonth(payingFixedExpense.day_of_month),
          account_id: selectedPaySource.kind === 'account' ? selectedPaySource.id : undefined,
          credit_card_id: selectedPaySource.kind === 'card' ? selectedPaySource.id : undefined,
        })
      ).unwrap();
      await dispatch(fetchAccountsThunk());
      refreshFixedStatus();
      refresh();
      const sourceName =
        selectedPaySource.kind === 'card'
          ? (() => {
              const card = cards.find((c) => c.id === selectedPaySource.id);
              return card ? `${cardLabel(card)} ••••${card.last_four}` : 'Tarjeta';
            })()
          : (() => {
              const acc = accounts.find((a) => a.id === selectedPaySource.id);
              return acc ? acc.name : 'Cuenta';
            })();
      pushToast({
        kind: 'success',
        title: 'Gasto fijo pagado',
        message: `${payingFixedExpense.name} · ${formatMoney(payingFixedExpense.amount)} (${sourceName})`,
      });
      setPayingFixedExpense(null);
    } catch {
      // el error ya se muestra desde el banner de arriba
    } finally {
      setIsPaying(false);
    }
  };

  const handleMarkPaid = async (fixed: FixedExpense) => {
    openPayModal(fixed);
  };

  const handleDeleteTxn = async (id: number) => {
    await dispatch(deleteTransactionThunk(id));
    dispatch(fetchAccountsThunk());
    refreshFixedStatus();
    refresh();
  };

  const categoryById = useMemo(() => {
    const map: Record<number, (typeof categories)[number]> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const sourceLabel = useCallback(
    (t: Transaction) => {
      if (t.credit_card_id) {
        const card = cards.find((c) => c.id === t.credit_card_id);
        return card ? `${cardLabel(card)} ••••${card.last_four}` : 'Tarjeta';
      }
      const account = accounts.find((a) => a.id === t.account_id);
      return account?.name ?? 'Cuenta';
    },
    [cards, accounts]
  );

  const total = useMemo(() => items.reduce((sum, t) => sum + Number(t.amount), 0), [items]);

  const groupedByDay = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    items.forEach((t) => {
      groups[t.transaction_date] = groups[t.transaction_date] ?? [];
      groups[t.transaction_date].push(t);
    });
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  const changePeriod = (delta: number) => {
    setAnchorDate((d) => {
      if (granularity === 'day') return shiftDate(d, delta);
      if (granularity === 'week') return shiftDate(d, delta * 7);
      return `${shiftMonthKey(d.slice(0, 7), delta)}-01`;
    });
  };

  const periodLabel =
    granularity === 'day'
      ? formatWeekdayShort(anchorDate)
      : granularity === 'week'
      ? formatRangeShort(startOfWeek(anchorDate), endOfWeek(anchorDate))
      : monthKeyLabel(month);

  const activeFixedExpenses = useMemo(() => fixedExpenses.filter((f) => f.is_active), [fixedExpenses]);
  const selectedCategory = categoryId !== null ? categoryById[categoryId] : undefined;
  const debitAccounts = useMemo(() => accounts.filter((a) => a.type === 'DEBIT'), [accounts]);

  const handleMethodChange = (m: PaymentMethod | null) => {
    setMethod(m);
    setSource(null);
  };

  const hasActiveFilters = categoryId !== null || source !== null || method !== null || onlyFixed;

  return {
    navigate,
    items,
    status,
    error,
    categories,
    accounts,
    cards,
    fixedExpenses,
    activeFixedExpenses,
    granularity,
    anchorDate,
    month,
    categoryId,
    categoryPickerOpen,
    source,
    method,
    onlyFixed,
    paidFixedIds,
    markingPaidId,
    categoryById,
    selectedCategory,
    debitAccounts,
    sourceLabel,
    total,
    groupedByDay,
    periodLabel,
    hasActiveFilters,
    methodOptions: METHOD_OPTIONS,
    setGranularity,
    setCategoryId,
    setCategoryPickerOpen,
    setSource,
    setOnlyFixed,
    handleMethodChange,
    changePeriod,
    handleMarkPaid,
    handleDeleteTxn,
    refresh,
    payingFixedExpense,
    selectedPaySource,
    isPaying,
    openPayModal,
    closePayModal,
    setSelectedPaySource,
    confirmPayFixed,
  };
};
