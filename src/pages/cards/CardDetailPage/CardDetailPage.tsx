import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { Card } from '../../../components/Card';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { Portal } from '../../../components/Portal';
import { PrimaryButton, SecondaryButton } from '../../../components/Buttons';
import { ProgressBar } from '../../../components/cards/ProgressBar';
import { CycleRing } from '../../../components/cards/CycleRing';
import { ErrorBanner, IconCircle } from '../../../components/Misc';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchCardDetailThunk } from '../../../store/slices/cardsSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import * as cardsApi from '../../../api/cards';
import { Category, Transaction } from '../../../types';
import { formatMoney } from '../../../utils/currency';
import { daysBetween, formatShort, formatRelativeToToday, todayISO } from '../../../utils/dateHelpers';
import { styles } from './CardDetailPage.styles';

export default function CardDetailPage() {
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

  const renderTxnGroups = (groups: [string, Transaction[]][], canDelete: boolean) =>
    groups.map(([date, txns]) => (
      <div key={date} style={{ marginBottom: spacing.lg }}>
        <p style={styles.dayGroupHeader}>{formatShort(date)}</p>
        {txns.map((t) => {
          const cat = t.category_id !== null ? categoryById[t.category_id] : undefined;
          return (
            <div key={t.id} style={styles.txnRow}>
              <IconCircle
                name={categoryIcons[cat?.name ?? ''] ?? 'file-tray-outline'}
                bg={colors.surfaceAlt}
                color={colors.textSecondary}
                size={36}
              />
              <div style={{ flex: 1, marginLeft: spacing.md }}>
                <p style={styles.txnLabel}>{t.description || cat?.name || 'Compra'}</p>
                <p style={styles.txnMeta}>
                  {cat?.name ?? '—'}
                  {t.fixed_expense_id !== null ? ' · Fijo' : ''}
                </p>
              </div>
              <span style={styles.txnValue}>{formatMoney(t.amount)}</span>
              {canDelete ? (
                <Pressable onClick={() => handleDeleteTxn(t.id)} style={styles.deleteBtn}>
                  <Icon name="trash-outline" size={16} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </div>
          );
        })}
      </div>
    ));

  if (!detail) {
    return (
      <PageShell>
        <TopBar title="Cargando…" onBack={() => navigate(-1)} />
        {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}
      </PageShell>
    );
  }

  const cycle = detail.current_cycle;
  const pending = detail.pending_cycle;
  const paidCycle = detail.last_paid_cycle;
  const pendingRemaining = pending ? Number(pending.total_amount) - Number(pending.paid_amount) : 0;
  const allocated = Number(detail.allocated_for_pending_cycle);
  const allocatedPercent = pendingRemaining > 0 ? Math.min(100, Math.round((allocated / pendingRemaining) * 100)) : 0;

  const totalCycleDays = cycle ? Math.max(1, daysBetween(cycle.start_date, cycle.end_date)) : 30;
  const currentDayIndex = cycle ? Math.max(1, Math.min(totalCycleDays, daysBetween(cycle.start_date, todayISO()) + 1)) : 1;

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <TopBar
        title={detail.name}
        onBack={() => navigate(-1)}
        right={
          <Pressable onClick={() => navigate(`/tarjetas/${cardId}/editar`)} style={{ padding: spacing.sm }}>
            <Icon name="settings-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

      <div style={styles.cardHeader}>
        <IconCircle name="card" bg={colors.surfaceAlt} color={detail.color ?? colors.accent} size={48} />
        <div style={{ flex: 1, marginLeft: spacing.md }}>
          <p style={styles.cardName}>
            {detail.name} ••••{detail.last_four}
          </p>
          <p style={styles.cardBank}>{detail.bank}</p>
        </div>
      </div>

      {cycle ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.5 }}>
              DÍAS DEL CICLO
            </span>
            <span style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: 700 }}>
              Corte {formatShort(cycle.end_date)} ({formatRelativeToToday(cycle.end_date)})
            </span>
          </div>

          <div style={styles.ringContainer}>
            <CycleRing dayIndex={currentDayIndex} totalDays={totalCycleDays} size={160} strokeWidth={12} color={detail.color ?? colors.accent} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: 0 }}>Acumulado actual</p>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, margin: 0 }}>{formatMoney(cycle.total_amount)}</p>
            </div>
            <Pressable
              onClick={openCurrentCycleModal}
              style={{ padding: `${spacing.sm}px ${spacing.md}px`, borderRadius: radius.pill, background: colors.surfaceAlt }}
            >
              <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>Ver movimientos</span>
            </Pressable>
          </div>
        </Card>
      ) : null}

      <div style={styles.statRow}>
        <Card style={{ flex: 1 }}>
          <p style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.5, margin: '0 0 4px' }}>LÍMITE</p>
          <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>{formatMoney(detail.credit_limit)}</p>
        </Card>
        <Card style={{ flex: 1 }}>
          <p style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.5, margin: '0 0 4px' }}>DISPONIBLE</p>
          <p style={{ color: colors.accent, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>{formatMoney(detail.available_credit)}</p>
        </Card>
      </div>

      {pending ? (
        <div style={styles.pendingBox}>
          <div style={styles.pendingHeader}>
            <div>
              <p style={styles.pendingLabel}>CICLO POR PAGAR</p>
              <p style={styles.pendingAmount}>{formatMoney(pendingRemaining)}</p>
            </div>
            <div style={styles.dueBadge}>
              <span style={styles.dueBadgeText}>Pagar antes de {formatShort(pending.due_date)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 600 }}>Apartado para este pago</span>
            <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>
              {formatMoney(allocated)} ({allocatedPercent}%)
            </span>
          </div>
          <ProgressBar percent={allocatedPercent} color={colors.accent} />

          <div style={styles.actionsRow}>
            <SecondaryButton label="Apartar" onPress={() => navigate(`/tarjetas/${cardId}/apartar`)} style={styles.actionBtn} />
            <PrimaryButton label="Pagar" onPress={() => navigate(`/tarjetas/${cardId}/pagar`)} style={styles.actionBtn} />
          </div>
        </div>
      ) : paidCycle ? (
        <div style={styles.pendingBox}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Icon name="checkmark-circle" size={16} color={colors.accent} />
                <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>Ciclo anterior pagado</span>
              </div>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>
                {formatMoney(paidCycle.total_amount)}
              </p>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                Venció el {formatShort(paidCycle.due_date)}
              </p>
            </div>
            <Pressable
              onClick={openPaidCycleModal}
              style={{ padding: `${spacing.sm}px ${spacing.md}px`, borderRadius: radius.pill, background: colors.surfaceAlt }}
            >
              <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>Ver consumos</span>
            </Pressable>
          </div>
        </div>
      ) : null}

      {paidCycleModalOpen && paidCycle ? (
        <Portal>
        <div style={styles.modalOverlay}>
          <div onClick={() => setPaidCycleModalOpen(false)} style={styles.modalBackdrop} />
          <div style={styles.modalSheet}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: spacing.lg }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Ciclo pagado</p>
                <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4, marginBottom: 0 }}>
                  {formatShort(paidCycle.start_date)} – {formatShort(paidCycle.end_date)} · total {formatMoney(paidCycle.total_amount)}
                </p>
              </div>
              <Pressable
                onClick={() => setPaidCycleModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name="close" size={18} color={colors.textPrimary} />
              </Pressable>
            </div>

            {paidCycleTransactions === null ? (
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>Cargando consumos…</p>
            ) : paidCycleTransactions.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>No hay consumos registrados para este ciclo.</p>
            ) : (
              renderTxnGroups(groupedPaidCycleTransactions, false)
            )}
          </div>
        </div>
        </Portal>
      ) : null}

      {currentCycleModalOpen ? (
        <Portal>
        <div style={styles.modalOverlay}>
          <div onClick={() => setCurrentCycleModalOpen(false)} style={styles.modalBackdrop} />
          <div style={styles.modalSheet}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: spacing.lg }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Ciclo actual</p>
                {cycle ? (
                  <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4, marginBottom: 0 }}>
                    {formatShort(cycle.start_date)} – {formatShort(cycle.end_date)} · acumulado {formatMoney(cycle.total_amount)} · se paga el{' '}
                    {formatShort(cycle.due_date)}
                  </p>
                ) : null}
              </div>
              <Pressable
                onClick={() => setCurrentCycleModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name="close" size={18} color={colors.textPrimary} />
              </Pressable>
            </div>

            {groupedByDay.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>No hay consumos registrados para este ciclo.</p>
            ) : (
              renderTxnGroups(groupedByDay, true)
            )}
          </div>
        </div>
        </Portal>
      ) : null}
    </PageShell>
  );
}
