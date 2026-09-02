import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { deleteIncomeReceiptThunk, fetchIncomesThunk, receiveIncomeThunk } from '../../../store/slices/incomesSlice';
import * as incomesApi from '../../../api/incomes';
import { formatMoney } from '../../../utils/currency';
import { formatShort, lastDayOfMonth, monthKeyLabel, shiftMonthKey, todayISO } from '../../../utils/dateHelpers';
import { styles } from './IncomeHistoryPage.styles';

export default function IncomeHistoryPage() {
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

  const refresh = useCallback(() => {
    return incomesApi
      .fetchIncomeReceipts({ ...monthBounds(), income_id: incomeFilter ?? undefined })
      .then(setReceipts);
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

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <TopBar title="Historial de ingresos" onBack={() => navigate(-1)} />
      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

      <div style={styles.monthRow}>
        <Pressable onClick={() => changeMonth(-1)} style={styles.monthArrow}>
          <Icon name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <span style={styles.monthLabel}>{monthKeyLabel(month)}</span>
        <Pressable onClick={() => changeMonth(1)} style={styles.monthArrow}>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </div>

      <div style={styles.totalCard}>
        <span style={styles.totalLabel}>TOTAL RECIBIDO</span>
        <span style={styles.totalValue}>{formatMoney(total)}</span>
        <span style={styles.totalMeta}>
          {(receipts ?? []).length} pago{(receipts ?? []).length === 1 ? '' : 's'}
        </span>
      </div>

      {activeIncomes.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Tus ingresos</p>
          {activeIncomes.map((income) => (
            <div key={income.id} style={styles.incomeRow}>
              <IconCircle name="cash-outline" bg={colors.surfaceAlt} color={colors.textSecondary} size={36} />
              <div style={{ flex: 1, marginLeft: spacing.md }}>
                <p style={styles.txnLabel}>{income.name}</p>
                <p style={styles.txnMeta}>{formatMoney(income.amount)}</p>
              </div>
              {paidIncomeIds.has(income.id) ? (
                <div style={styles.paidBadge}>
                  <Icon name="checkmark-circle" size={14} color={colors.accent} />
                  <span style={styles.paidBadgeLabel}>Pagado</span>
                </div>
              ) : (
                <Pressable style={styles.payBtn} onClick={() => handleMarkPaid(income.id)} disabled={markingId === income.id}>
                  <span style={styles.payBtnLabel}>{markingId === income.id ? 'Guardando…' : 'Marcar pagado hoy'}</span>
                </Pressable>
              )}
            </div>
          ))}
        </>
      ) : null}

      <p style={styles.filterLabel}>Filtrar por ingreso</p>
      <div style={styles.chipsRow}>
        <Chip label="Todos" active={incomeFilter === null} onPress={() => setIncomeFilter(null)} />
        {incomes.map((i) => (
          <Chip key={i.id} label={i.name} active={incomeFilter === i.id} onPress={() => setIncomeFilter(i.id)} />
        ))}
      </div>

      <div style={styles.divider} />

      {groupedByDay.length === 0 ? (
        <EmptyState
          icon="cash-outline"
          title="Sin ingresos registrados"
          description="Cuando marques un ingreso como pagado, aquí verás el historial de este mes."
        />
      ) : (
        groupedByDay.map(([date, items]) => (
          <div key={date} style={{ marginBottom: spacing.lg }}>
            <p style={styles.dayHeader}>{formatShort(date)}</p>
            {items.map((r) => (
              <div key={r.id} style={styles.txnRow}>
                <IconCircle name="checkmark-circle-outline" bg={colors.accentMuted} color={colors.accent} size={36} />
                <div style={{ flex: 1, marginLeft: spacing.md }}>
                  <p style={styles.txnLabel}>{incomeById[r.income_id]?.name ?? 'Ingreso'}</p>
                </div>
                <span style={styles.txnValue}>+{formatMoney(r.amount)}</span>
                <Pressable
                  onClick={() => handleDeleteReceipt(r.id)}
                  disabled={deletingReceiptId === r.id}
                  style={styles.deleteBtn}
                >
                  <Icon name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              </div>
            ))}
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
