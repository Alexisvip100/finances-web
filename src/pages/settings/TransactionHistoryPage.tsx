import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { TopBar } from '../../components/TopBar';
import { EmptyState, ErrorBanner, IconCircle } from '../../components/Misc';
import { Icon } from '../../components/Icon';
import { Portal } from '../../components/Portal';
import { Pressable } from '../../components/Pressable';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteTransactionThunk, fetchTransactionsThunk, payFixedExpenseThunk } from '../../store/slices/transactionsSlice';
import { fetchCategoriesThunk } from '../../store/slices/categoriesSlice';
import { fetchAccountsThunk } from '../../store/slices/accountsSlice';
import { fetchCardsThunk } from '../../store/slices/cardsSlice';
import { fetchFixedExpensesThunk } from '../../store/slices/fixedExpensesSlice';
import * as transactionsApi from '../../api/transactions';
import * as fixedExpensesApi from '../../api/fixedExpenses';
import { PaymentMethod, Transaction } from '../../types';
import { formatMoney } from '../../utils/currency';
import {
  endOfWeek,
  formatRangeShort,
  formatShort,
  formatWeekdayShort,
  lastDayOfMonth,
  monthKeyLabel,
  shiftDate,
  shiftMonthKey,
  startOfWeek,
  todayISO,
} from '../../utils/dateHelpers';
import { accountLabel, cardLabel } from '../../utils/labels';

type SourceFilter = { kind: 'account' | 'card'; id: number } | null;

const METHOD_OPTIONS: { value: PaymentMethod | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'CASH', label: 'Efectivo' },
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
];

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.transactions);
  const categories = useAppSelector((s) => s.categories.items);
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);
  const fixedExpenses = useAppSelector((s) => s.fixedExpenses.items);

  const [granularity, setGranularity] = useState<'month' | 'week' | 'day'>('month');
  const [anchorDate, setAnchorDate] = useState(todayISO());
  const month = anchorDate.slice(0, 7);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [source, setSource] = useState<SourceFilter>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [onlyFixed, setOnlyFixed] = useState(false);
  const [paidFixedIds, setPaidFixedIds] = useState<Set<number>>(new Set());
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchAccountsThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchFixedExpensesThunk());
  }, [dispatch]);

  // Independiente de qué tanto se esté viendo (día/semana/mes): el bloque de
  // "gastos fijos de este mes" y su estado de pagado siempre son del mes
  // calendario completo, no de la ventana que el usuario esté filtrando.
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

  // Independiente de los demás filtros: para saber qué gastos fijos ya se
  // pagaron este mes sin que un filtro (categoría/cuenta/método) los oculte.
  const refreshFixedStatus = useCallback(() => {
    transactionsApi
      .fetchTransactions({ ...monthBounds(), only_fixed_expenses: true })
      .then((txns) => setPaidFixedIds(new Set(txns.map((t) => t.fixed_expense_id).filter((id): id is number => id !== null))));
  }, [monthBounds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refreshFixedStatus();
  }, [refreshFixedStatus]);

  // Resuelve una fecha concreta dentro del mes que se está viendo (no
  // siempre "hoy" — si el usuario está viendo el mes siguiente y marca un
  // gasto fijo como pagado, la transacción debe caer en ESE mes).
  const resolveDateInViewedMonth = (dayOfMonth: number) => {
    const [year, monthNum] = month.split('-').map(Number);
    const day = Math.min(dayOfMonth, lastDayOfMonth(year, monthNum));
    return `${month}-${String(day).padStart(2, '0')}`;
  };

  const handleMarkPaid = async (fixed: fixedExpensesApi.FixedExpense) => {
    setMarkingPaidId(fixed.id);
    try {
      await dispatch(
        payFixedExpenseThunk({ id: fixed.id, transactionDate: resolveDateInViewedMonth(fixed.day_of_month) })
      ).unwrap();
      refreshFixedStatus();
      refresh();
    } catch {
      // el error ya se muestra desde el banner de arriba (transactions.error)
    } finally {
      setMarkingPaidId(null);
    }
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
    granularity === 'day' ? formatWeekdayShort(anchorDate) : granularity === 'week' ? formatRangeShort(startOfWeek(anchorDate), endOfWeek(anchorDate)) : monthKeyLabel(month);

  const activeFixedExpenses = useMemo(() => fixedExpenses.filter((f) => f.is_active), [fixedExpenses]);
  const selectedCategory = categoryId !== null ? categoryById[categoryId] : undefined;
  const debitAccounts = useMemo(() => accounts.filter((a) => a.type === 'DEBIT'), [accounts]);

  const handleMethodChange = (m: PaymentMethod | null) => {
    setMethod(m);
    setSource(null);
  };

  const hasActiveFilters = categoryId !== null || source !== null || method !== null || onlyFixed;

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <TopBar title="Historial de gastos" onBack={() => navigate(-1)} />
      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

      <div style={styles.chipsRow}>
        <Chip label="Día" active={granularity === 'day'} onPress={() => setGranularity('day')} />
        <Chip label="Semana" active={granularity === 'week'} onPress={() => setGranularity('week')} />
        <Chip label="Mes" active={granularity === 'month'} onPress={() => setGranularity('month')} />
      </div>

      <div style={styles.monthRow}>
        <Pressable onClick={() => changePeriod(-1)} style={styles.monthArrow}>
          <Icon name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <span style={styles.monthLabel}>{periodLabel}</span>
        <Pressable onClick={() => changePeriod(1)} style={styles.monthArrow}>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </div>

      <div style={styles.totalCard}>
        <span style={styles.totalLabel}>TOTAL {hasActiveFilters ? '(filtrado)' : ''}</span>
        <span style={styles.totalValue}>{formatMoney(total)}</span>
        <span style={styles.totalMeta}>{items.length} movimiento{items.length === 1 ? '' : 's'}</span>
      </div>

      {activeFixedExpenses.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Gastos fijos de este mes</p>
          {activeFixedExpenses.map((f) => {
            const paid = paidFixedIds.has(f.id);
            const category = categoryById[f.category_id];
            return (
              <div key={f.id} style={styles.fixedRow}>
                <IconCircle name={categoryIcons[category?.name ?? ''] ?? 'repeat-outline'} bg={colors.surfaceAlt} color={colors.textSecondary} size={36} />
                <div style={{ flex: 1, marginLeft: spacing.md }}>
                  <p style={styles.txnLabel}>{f.name}</p>
                  <p style={styles.txnMeta}>
                    {formatMoney(f.amount)} · día {f.day_of_month}
                  </p>
                </div>
                {paid ? (
                  <div style={styles.paidBadge}>
                    <Icon name="checkmark-circle" size={14} color={colors.accent} />
                    <span style={styles.paidBadgeLabel}>Pagado</span>
                  </div>
                ) : (
                  <Pressable style={styles.payBtn} onClick={() => handleMarkPaid(f)} disabled={markingPaidId === f.id}>
                    <span style={styles.payBtnLabel}>{markingPaidId === f.id ? 'Guardando…' : 'Marcar pagado'}</span>
                  </Pressable>
                )}
              </div>
            );
          })}
        </>
      ) : null}

      <p style={styles.filterLabel}>Tipo</p>
      <div style={styles.chipsRow}>
        <Chip label="Todos" active={!onlyFixed} onPress={() => setOnlyFixed(false)} />
        <Chip label="Solo gastos fijos" active={onlyFixed} onPress={() => setOnlyFixed(true)} />
      </div>

      <p style={styles.filterLabel}>Categoría</p>
      <Pressable style={styles.selectRow} onClick={() => setCategoryPickerOpen(true)}>
        <Icon
          name={categoryIcons[selectedCategory?.name ?? ''] ?? 'apps-outline'}
          size={16}
          color={colors.textSecondary}
          style={{ marginRight: spacing.sm }}
        />
        <span style={styles.selectLabel}>{selectedCategory ? selectedCategory.name : 'Todas'}</span>
        <Icon name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {categoryPickerOpen ? (
        <Portal>
        <>
          <div style={styles.modalBackdrop} onClick={() => setCategoryPickerOpen(false)} />
          <div style={styles.modalSheet}>
            <p style={styles.modalTitle}>Categoría</p>
            <div style={styles.modalList}>
              <Pressable
                style={styles.modalRow}
                onClick={() => {
                  setCategoryId(null);
                  setCategoryPickerOpen(false);
                }}
              >
                <Icon name="apps-outline" size={18} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
                <span style={styles.modalRowLabel}>Todas</span>
                {categoryId === null ? <Icon name="checkmark" size={18} color={colors.accent} /> : null}
              </Pressable>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.modalRow}
                  onClick={() => {
                    setCategoryId(c.id);
                    setCategoryPickerOpen(false);
                  }}
                >
                  <Icon name={categoryIcons[c.name] ?? 'pricetag-outline'} size={18} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
                  <span style={styles.modalRowLabel}>{c.name}</span>
                  {categoryId === c.id ? <Icon name="checkmark" size={18} color={colors.accent} /> : null}
                </Pressable>
              ))}
            </div>
          </div>
        </>
        </Portal>
      ) : null}

      <p style={styles.filterLabel}>Método de pago</p>
      <div style={styles.chipsRow}>
        {METHOD_OPTIONS.map((opt) => (
          <Chip key={opt.label} label={opt.label} active={method === opt.value} onPress={() => handleMethodChange(opt.value)} />
        ))}
      </div>

      {method === 'DEBIT' && debitAccounts.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Cuenta de débito</p>
          <div style={styles.chipsRow}>
            <Chip label="Todas" active={source === null} onPress={() => setSource(null)} />
            {debitAccounts.map((a) => (
              <Chip
                key={`a-${a.id}`}
                label={accountLabel(a)}
                active={source?.kind === 'account' && source.id === a.id}
                onPress={() => setSource({ kind: 'account', id: a.id })}
              />
            ))}
          </div>
        </>
      ) : null}

      {method === 'CREDIT' && cards.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Tarjeta de crédito</p>
          <div style={styles.chipsRow}>
            <Chip label="Todas" active={source === null} onPress={() => setSource(null)} />
            {cards.map((c) => (
              <Chip
                key={`c-${c.id}`}
                label={`${cardLabel(c)} ••••${c.last_four}`}
                active={source?.kind === 'card' && source.id === c.id}
                onPress={() => setSource({ kind: 'card', id: c.id })}
              />
            ))}
          </div>
        </>
      ) : null}

      <div style={styles.divider} />

      {groupedByDay.length === 0 && status !== 'loading' ? (
        <EmptyState
          icon="receipt-outline"
          title="Sin movimientos"
          description="No hay gastos que coincidan con estos filtros en este mes."
        />
      ) : (
        groupedByDay.map(([date, txns]) => (
          <div key={date} style={{ marginBottom: spacing.lg }}>
            <p style={styles.dayHeader}>{formatShort(date)}</p>
            {txns.map((t) => {
              const category = t.category_id !== null ? categoryById[t.category_id] : undefined;
              return (
                <div key={t.id} style={styles.txnRow}>
                  <IconCircle
                    name={categoryIcons[category?.name ?? ''] ?? 'file-tray-outline'}
                    bg={colors.surfaceAlt}
                    color={colors.textSecondary}
                    size={36}
                  />
                  <div style={{ flex: 1, marginLeft: spacing.md }}>
                    <p style={styles.txnLabel}>{t.description || category?.name || 'Compra'}</p>
                    <p style={styles.txnMeta}>
                      {category?.name ?? '—'} · {sourceLabel(t)}
                      {t.fixed_expense_id !== null ? ' · Fijo' : ''}
                    </p>
                  </div>
                  <span style={styles.txnValue}>{formatMoney(t.amount)}</span>
                  <Pressable onClick={() => dispatch(deleteTransactionThunk(t.id))} style={styles.deleteBtn}>
                    <Icon name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                </div>
              );
            })}
          </div>
        ))
      )}
    </PageShell>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }} onClick={onPress}>
      <span style={{ ...styles.chipLabel, ...(active ? styles.chipLabelActive : {}) }}>{label}</span>
    </Pressable>
  );
}

const styles: Record<string, React.CSSProperties> = {
  monthRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  monthArrow: { width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  monthLabel: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, minWidth: 140, textAlign: 'center' },
  totalCard: { display: 'flex', flexDirection: 'column', background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.xl, alignItems: 'center' },
  totalLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.6 },
  totalValue: { color: colors.textPrimary, fontSize: fontSize.amountSm, fontWeight: 800, lineHeight: 1.1, marginTop: spacing.xs },
  totalMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  filterLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, marginBottom: spacing.sm, marginTop: spacing.lg },
  fixedRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', background: colors.surface, borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm },
  paidBadge: { display: 'flex', flexDirection: 'row', alignItems: 'center', background: colors.accentMuted, borderRadius: radius.pill, paddingLeft: spacing.sm, paddingRight: spacing.sm, paddingTop: 4, paddingBottom: 4, gap: 4 },
  paidBadgeLabel: { color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 },
  payBtn: { background: colors.accent, borderRadius: radius.pill, paddingLeft: spacing.md, paddingRight: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  payBtnLabel: { color: colors.black, fontSize: fontSize.xs, fontWeight: 700 },
  chipsRow: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingLeft: spacing.lg, paddingRight: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, borderRadius: radius.pill, background: colors.surface },
  chipActive: { background: colors.accentMuted, border: `1px solid ${colors.accent}` },
  chipLabel: { color: colors.textSecondary, fontWeight: 600, fontSize: fontSize.sm },
  chipLabelActive: { color: colors.accent },
  selectRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.input,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    width: '100%',
  },
  selectLabel: { flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, textAlign: 'left' },
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 },
  modalSheet: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    background: colors.surfaceAlt,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 720,
    margin: '0 auto',
    zIndex: 51,
  },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, marginBottom: spacing.md },
  modalList: { maxHeight: 320, overflowY: 'auto' },
  modalRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottom: `1px solid ${colors.divider}`,
    width: '100%',
  },
  modalRowLabel: { flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, textAlign: 'left' },
  divider: { height: 1, background: colors.divider, marginTop: spacing.xl, marginBottom: spacing.lg },
  dayHeader: { color: colors.accent, fontSize: fontSize.xs, fontWeight: 700, marginBottom: spacing.sm, textTransform: 'uppercase' },
  txnRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', background: colors.surface, borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm },
  txnLabel: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, margin: 0 },
  txnMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, margin: 0 },
  txnValue: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, marginLeft: spacing.sm },
  deleteBtn: { padding: spacing.sm, marginLeft: spacing.xs },
};
