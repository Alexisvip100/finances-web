import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { Card } from '../../components/Card';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../components/Misc';
import { Icon } from '../../components/Icon';
import { Skeleton, SkeletonRow } from '../../components/Skeleton';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { AddExpenseButton } from '../../components/AddExpenseButton';
import { Pressable } from '../../components/Pressable';
import { colors, fontSize, radius, spacing, categoryIcons } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchDashboardThunk } from '../../store/slices/dashboardSlice';
import { fetchCardsThunk } from '../../store/slices/cardsSlice';
import { fetchBudgetThunk } from '../../store/slices/budgetSlice';
import { formatMoney } from '../../utils/currency';
import { formatRelativeToToday, formatWeekdayShort, todayISO } from '../../utils/dateHelpers';
import { cardLabel } from '../../utils/labels';

function iconForKind(kind: string): string {
  if (kind === 'card_due') return 'card-outline';
  if (kind === 'installment') return 'repeat-outline';
  return 'file-tray-outline';
}

function BreakdownRow({
  label,
  value,
  color,
  icon,
  last,
}: {
  label: string;
  value: string;
  color?: string;
  icon: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing.md}px 0`,
        borderBottom: last ? 'none' : `1px solid ${colors.divider}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <IconCircle name={icon} bg={colors.surfaceAlt} color={color ?? colors.textSecondary} size={28} />
        <span style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{label}</span>
      </div>
      <span style={{ color: color ?? colors.textPrimary, fontSize: fontSize.md, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((s) => s.dashboard);
  const cards = useAppSelector((s) => s.cards.items);
  const budget = useAppSelector((s) => s.budget);

  const refresh = useCallback(() => {
    dispatch(fetchDashboardThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchBudgetThunk(budget.month));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, budget.month]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = dashboard.data;
  const loadingDashboard = dashboard.status === 'loading' && !data;
  const loadingBudget = budget.status === 'loading' && !budget.data;

  const budgetTotals = budget.data?.categories.reduce(
    (acc, c) => {
      if (c.monthly_limit) {
        acc.limit += Number(c.monthly_limit);
        acc.spent += Number(c.spent);
      }
      return acc;
    },
    { limit: 0, spent: 0 }
  );
  const budgetPercent = budgetTotals && budgetTotals.limit > 0 ? Math.round((budgetTotals.spent / budgetTotals.limit) * 100) : null;

  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800 }}>Ciclos</span>
        <AddExpenseButton />
      </div>

      <p style={{ color: colors.textMuted, fontSize: fontSize.sm, margin: 0 }}>Hoy</p>
      <p style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, marginTop: 2, marginBottom: spacing.xl }}>
        {formatWeekdayShort(todayISO())}
      </p>

      {dashboard.error ? <ErrorBanner message={dashboard.error} onRetry={refresh} /> : null}

      <Card style={{ marginBottom: spacing.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
          <Icon name="wallet-outline" size={14} color={colors.textSecondary} />
          <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, margin: 0 }}>Disponible real</p>
        </div>
        {loadingDashboard ? (
          <Skeleton width={180} height={fontSize.amountLg} style={{ marginBottom: spacing.lg }} />
        ) : (
          <p style={{ color: colors.accent, fontSize: fontSize.amountLg, fontWeight: 800, lineHeight: 1.1, marginBottom: spacing.lg }}>
            {data ? formatMoney(data.available) : '—'}
          </p>
        )}
        {loadingDashboard ? (
          <div style={{ borderTop: `1px solid ${colors.divider}`, paddingTop: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            <Skeleton width="90%" height={15} />
            <Skeleton width="80%" height={15} />
            <Skeleton width="85%" height={15} />
          </div>
        ) : data ? (
          <div style={{ borderTop: `1px solid ${colors.divider}`, paddingTop: spacing.sm }}>
            <BreakdownRow label="En cuentas" value={formatMoney(data.accounts_total)} icon="business-outline" />
            <BreakdownRow label="Comprometido" value={`-${formatMoney(data.committed)}`} color={colors.warning} icon="trending-down-outline" />
            <BreakdownRow
              label="Fijos pendientes"
              value={`-${formatMoney(data.pending_fixed)}`}
              color={colors.warning}
              icon="calendar-outline"
              last
            />
          </div>
        ) : null}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h2 style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Próximas salidas</h2>
        <Pressable onClick={() => navigate('/flujo')} style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.5 }}>
          VER TODAS
        </Pressable>
      </div>

      {loadingDashboard ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : !data || data.upcoming_outflows.length === 0 ? (
        <EmptyState icon="calendar-outline" title="Sin salidas próximas" description="Cuando registres tarjetas o gastos fijos, aquí verás lo que se acerca." />
      ) : (
        data.upcoming_outflows.slice(0, 4).map((o, idx) => (
          <div
            key={`${o.kind}-${o.date}-${idx}`}
            style={{ display: 'flex', alignItems: 'center', background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.md }}
          >
            <IconCircle name={categoryIcons[o.label] ?? iconForKind(o.kind)} bg={colors.surfaceAlt} color={colors.textSecondary} size={40} />
            <div style={{ flex: 1, marginLeft: spacing.md }}>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{o.label}</p>
              <p style={{ color: formatRelativeToToday(o.date) === 'Hoy' ? colors.danger : colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                {formatRelativeToToday(o.date)}
              </p>
            </div>
            <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>{formatMoney(o.amount)}</span>
          </div>
        ))
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h2 style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Tus tarjetas</h2>
        <Pressable onClick={() => navigate('/tarjetas')} style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.5 }}>
          GESTIONAR
        </Pressable>
      </div>

      {loadingDashboard ? (
        <SkeletonRow />
      ) : !data || data.cards.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title="Sin tarjetas"
          description="Agrega tu primera tarjeta para ver su ciclo y saldo comprometido."
          actionLabel="Agregar tarjeta"
          onAction={() => navigate('/tarjetas/nueva')}
        />
      ) : (
        data.cards.map((c) => {
          const fullCard = cards.find((card) => card.id === c.id);
          return (
            <Card key={c.id} onPress={() => navigate(`/tarjetas/${c.id}`)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <IconCircle name="card" bg={colors.surfaceAlt} color={fullCard?.color ?? colors.accent} size={40} />
              <div style={{ flex: 1, marginLeft: spacing.md }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{fullCard ? cardLabel(fullCard) : c.name}</p>
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>Acumulado</p>
              </div>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>
                {c.current_cycle ? formatMoney(c.current_cycle.total_amount) : '—'}
              </span>
            </Card>
          );
        })
      )}

      {loadingBudget ? (
        <Card style={{ marginTop: spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Skeleton width={140} height={16} />
            <Skeleton width={80} height={20} radius={radius.pill} />
          </div>
          <Skeleton width="100%" height={8} radius={8} />
        </Card>
      ) : budgetPercent !== null ? (
        <Card style={{ marginTop: spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <span style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800 }}>PRESUPUESTO MES</span>
            <Badge label={`${budgetPercent}% gastado`} tone={budgetPercent >= 100 ? 'danger' : budgetPercent >= 80 ? 'warning' : 'success'} />
          </div>
          <ProgressBar percent={budgetPercent} color={budgetPercent >= 100 ? colors.danger : colors.accent} />
        </Card>
      ) : null}
    </PageShell>
  );
}
