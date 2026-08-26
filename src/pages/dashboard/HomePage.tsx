import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { Card } from '../../components/Card';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../components/Misc';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { Icon } from '../../components/Icon';
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

function BreakdownRow({ label, value, color, last }: { label: string; value: string; color?: string; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${spacing.md}px 0`,
        borderBottom: last ? 'none' : `1px solid ${colors.divider}`,
      }}
    >
      <span style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{label}</span>
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
    <PageShell
      floating={
        <Pressable
          onClick={() => navigate('/gastos/nuevo')}
          scaleTo={0.88}
          style={{
            position: 'fixed',
            right: spacing.lg,
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            width: 58,
            height: 58,
            borderRadius: 29,
            background: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 12px ${colors.accent}66`,
          }}
        >
          <Icon name="add" size={28} color={colors.black} />
        </Pressable>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.lg }}>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800 }}>Ciclos</span>
      </div>

      <p style={{ color: colors.textMuted, fontSize: fontSize.sm, margin: 0 }}>Hoy</p>
      <p style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, marginTop: 2, marginBottom: spacing.xl }}>
        {formatWeekdayShort(todayISO())}
      </p>

      {dashboard.error ? <ErrorBanner message={dashboard.error} onRetry={refresh} /> : null}

      <Card style={{ marginBottom: spacing.xl }}>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.sm }}>Disponible real</p>
        <p style={{ color: colors.accent, fontSize: fontSize.amountLg, fontWeight: 800, marginBottom: spacing.lg }}>
          {data ? formatMoney(data.available) : '—'}
        </p>
        {data ? (
          <div style={{ borderTop: `1px solid ${colors.divider}`, paddingTop: spacing.sm }}>
            <BreakdownRow label="En cuentas" value={formatMoney(data.accounts_total)} />
            <BreakdownRow label="Comprometido" value={`-${formatMoney(data.committed)}`} color={colors.warning} />
            <BreakdownRow label="Fijos pendientes" value={`-${formatMoney(data.pending_fixed)}`} color={colors.warning} last />
          </div>
        ) : null}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h2 style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Próximas salidas</h2>
        <Pressable onClick={() => navigate('/flujo')} style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.5 }}>
          VER TODAS
        </Pressable>
      </div>

      {!data || data.upcoming_outflows.length === 0 ? (
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

      {!data || data.cards.length === 0 ? (
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

      {budgetPercent !== null ? (
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
