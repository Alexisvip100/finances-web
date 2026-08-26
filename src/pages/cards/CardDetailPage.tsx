import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { TopBar } from '../../components/TopBar';
import { Card } from '../../components/Card';
import { Pressable } from '../../components/Pressable';
import { Icon } from '../../components/Icon';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { CycleRing } from '../../components/cards/CycleRing';
import { ErrorBanner, IconCircle } from '../../components/Misc';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCardDetailThunk } from '../../store/slices/cardsSlice';
import { fetchCategoriesThunk } from '../../store/slices/categoriesSlice';
import * as cardsApi from '../../api/cards';
import { Category, Transaction } from '../../types';
import { formatMoney } from '../../utils/currency';
import { daysBetween, formatShort, formatRelativeToToday, todayISO } from '../../utils/dateHelpers';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  useEffect(() => {
    if (detail?.current_cycle) {
      cardsApi.fetchCycleTransactions(cardId, detail.current_cycle.id).then(setCycleTransactions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const openPaidCycleModal = () => {
    if (!detail?.last_paid_cycle) return;
    setPaidCycleModalOpen(true);
    setPaidCycleTransactions(null);
    cardsApi.fetchCycleTransactions(cardId, detail.last_paid_cycle.id).then(setPaidCycleTransactions);
  };

  if (!detail) {
    return (
      <PageShell>
        <TopBar title="Tarjeta" onBack={() => navigate(-1)} />
        {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}
      </PageShell>
    );
  }

  const cycle = detail.current_cycle;
  const pending = detail.pending_cycle;
  const pendingRemaining = pending ? Number(pending.total_amount) - Number(pending.paid_amount) : 0;
  const allocated = Number(detail.allocated_for_pending_cycle);
  const allocatedPercent = pendingRemaining > 0 ? Math.min(100, Math.round((allocated / pendingRemaining) * 100)) : 0;

  const dayIndex = cycle ? daysBetween(cycle.start_date, todayISO()) + 1 : 0;
  const totalDays = cycle ? daysBetween(cycle.start_date, cycle.end_date) : 0;
  const daysUntilDue = pending ? daysBetween(todayISO(), pending.due_date) : 0;

  const renderTxnGroups = (groups: [string, Transaction[]][], markToday: boolean) =>
    groups.map(([date, txns]) => (
      <div key={date} style={{ marginBottom: spacing.lg }}>
        <p style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700, marginBottom: spacing.sm, marginTop: 0 }}>
          {markToday && formatRelativeToToday(date) === 'Hoy' ? `Hoy ${formatShort(date)}` : formatShort(date)}
        </p>
        {txns.map((t) => {
          const category = t.category_id !== null ? categoryById[t.category_id] : undefined;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                background: colors.surface,
                borderRadius: radius.card,
                padding: spacing.md,
                marginBottom: spacing.sm,
                gap: spacing.md,
              }}
            >
              <IconCircle name={categoryIcons[category?.name ?? ''] ?? 'file-tray-outline'} bg={colors.surfaceAlt} color={colors.textSecondary} size={36} />
              <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, flex: 1 }}>{t.description || category?.name || 'Compra'}</span>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700 }}>{formatMoney(t.amount)}</span>
            </div>
          );
        })}
      </div>
    ));

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <TopBar title={`${detail.bank} ••••${detail.last_four}`} onBack={() => navigate(-1)} />
      <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg, marginTop: 0 }}>
        {detail.name} · Límite {formatMoney(detail.credit_limit)}
      </p>

      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

      <Card style={{ marginBottom: spacing.lg, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.6 }}>CRÉDITO DISPONIBLE</span>
        <span style={{ color: colors.accent, fontSize: fontSize.xl, fontWeight: 800, marginTop: spacing.xs }}>{formatMoney(detail.available_credit)}</span>
      </Card>

      {cycle ? (
        <Card onPress={() => setCurrentCycleModalOpen(true)} style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>CICLO ACTUAL</span>
            <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 700 }}>ACUMULADO</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, margin: 0 }}>
                {formatShort(cycle.start_date)} – {formatShort(cycle.end_date)}
              </p>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.amountSm, fontWeight: 800, marginTop: 4, marginBottom: 0 }}>{formatMoney(cycle.total_amount)}</p>
            </div>
            <CycleRing dayIndex={Math.max(1, dayIndex)} totalDays={Math.max(totalDays, 1)} />
          </div>
          <ProgressBar percent={totalDays > 0 ? (dayIndex / totalDays) * 100 : 0} color={colors.accent} />
          <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.sm, marginBottom: 0 }}>
            Día {Math.max(1, dayIndex)} · Faltan {Math.max(0, totalDays - dayIndex)} días
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm }}>
            <Icon name="calendar-outline" size={13} color={colors.textMuted} style={{ marginRight: 6, flexShrink: 0 }} />
            <span style={{ color: colors.textMuted, fontSize: fontSize.xs, flex: 1, lineHeight: '16px' }}>
              Lo que se acumule aquí se paga el {formatShort(cycle.due_date)} — no es lo mismo que un ciclo ya cerrado.
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: spacing.md,
              paddingTop: spacing.md,
              borderTop: `1px solid ${colors.divider}`,
            }}
          >
            <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 600, marginRight: 4 }}>Toca para ver los consumos de este ciclo</span>
            <Icon name="chevron-forward" size={14} color={colors.textMuted} />
          </div>
        </Card>
      ) : null}

      {!pending && detail.last_paid_cycle ? (
        <Card onPress={openPaidCycleModal} style={{ marginBottom: spacing.lg, display: 'flex', flexDirection: 'row', alignItems: 'center', background: colors.accentMuted }}>
          <Icon name="checkmark-circle" size={20} color={colors.accent} style={{ marginRight: spacing.md, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>Ciclo anterior pagado</p>
            <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2, marginBottom: 0 }}>
              {formatMoney(detail.last_paid_cycle.total_amount)} · vencía {formatShort(detail.last_paid_cycle.due_date)}
            </p>
          </div>
          <Icon name="chevron-forward" size={16} color={colors.textMuted} />
        </Card>
      ) : null}

      {pending ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>POR PAGAR CICLO ANT.</span>
            <span style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
              {formatShort(pending.start_date)} – {formatShort(pending.end_date)}
            </span>
          </div>
          <p style={{ color: colors.textPrimary, fontSize: fontSize.amountSm, fontWeight: 800, marginBottom: spacing.md, marginTop: 0 }}>{formatMoney(pendingRemaining)}</p>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="calendar-outline" size={14} color={colors.danger} style={{ marginRight: 6 }} />
            <span style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: 600 }}>
              Vence {formatShort(pending.due_date)} (Faltan {Math.max(0, daysUntilDue)} días)
            </span>
          </div>
        </Card>
      ) : null}

      {pending && pendingRemaining > 0 ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <span style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800 }}>Apartado</span>
            <SecondaryButton
              label="Apartar"
              onPress={() => navigate(`/tarjetas/${cardId}/apartar`)}
              style={{ padding: `${spacing.sm}px ${spacing.lg}px`, width: 'auto' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md }}>
            <span style={{ color: colors.accent, fontSize: fontSize.xl, fontWeight: 800 }}>{formatMoney(allocated)}</span>
            <span style={{ color: colors.textMuted, fontSize: fontSize.md, marginLeft: spacing.xs }}>/ {formatMoney(pendingRemaining)}</span>
          </div>
          <ProgressBar percent={allocatedPercent} color={colors.accent} />
        </Card>
      ) : null}

      {detail.installment_plans.length > 0 ? (
        <>
          <p style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.6, marginBottom: spacing.md }}>MESES SIN INTERESES</p>
          {detail.installment_plans.map((plan) => (
            <div
              key={plan.id}
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md }}
            >
              <IconCircle name="laptop-outline" bg={colors.surfaceAlt} color={colors.textSecondary} size={40} />
              <div style={{ flex: 1, marginLeft: spacing.md }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{plan.description}</p>
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, marginBottom: 0 }}>
                  {plan.months_paid} de {plan.months_total} pagos
                </p>
              </div>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>{formatMoney(plan.monthly_amount)}</span>
            </div>
          ))}
        </>
      ) : null}

      {pending && pendingRemaining > 0 ? (
        <PrimaryButton label="Pagar tarjeta" onPress={() => navigate(`/tarjetas/${cardId}/pagar`)} style={{ marginTop: spacing.xl }} />
      ) : null}

      {paidCycleModalOpen ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setPaidCycleModalOpen(false)} style={{ position: 'absolute', inset: 0, background: colors.overlay }} />
          <div
            style={{
              position: 'relative',
              background: colors.surfaceAlt,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              padding: spacing.lg,
              paddingBottom: spacing.xxl,
              maxHeight: '75%',
              overflowY: 'auto',
              maxWidth: 720,
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: spacing.lg }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Ciclo pagado</p>
                {detail.last_paid_cycle ? (
                  <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4, marginBottom: 0 }}>
                    {formatShort(detail.last_paid_cycle.start_date)} – {formatShort(detail.last_paid_cycle.end_date)} · pagado{' '}
                    {formatMoney(detail.last_paid_cycle.paid_amount)}
                  </p>
                ) : null}
              </div>
              <Pressable
                onClick={() => setPaidCycleModalOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name="close" size={18} color={colors.textPrimary} />
              </Pressable>
            </div>

            {paidCycleTransactions === null ? (
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>Cargando…</p>
            ) : groupedPaidCycleTransactions.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>No hay consumos registrados para este ciclo.</p>
            ) : (
              renderTxnGroups(groupedPaidCycleTransactions, false)
            )}
          </div>
        </div>
      ) : null}

      {currentCycleModalOpen ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setCurrentCycleModalOpen(false)} style={{ position: 'absolute', inset: 0, background: colors.overlay }} />
          <div
            style={{
              position: 'relative',
              background: colors.surfaceAlt,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              padding: spacing.lg,
              paddingBottom: spacing.xxl,
              maxHeight: '75%',
              overflowY: 'auto',
              maxWidth: 720,
              margin: '0 auto',
              width: '100%',
            }}
          >
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
      ) : null}
    </PageShell>
  );
}
