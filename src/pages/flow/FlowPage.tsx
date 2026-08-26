import React, { useEffect } from 'react';
import { PageShell } from '../../components/PageShell';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../components/Misc';
import { Skeleton, SkeletonRow } from '../../components/Skeleton';
import { AddExpenseButton } from '../../components/AddExpenseButton';
import { Pressable } from '../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFlowThunk } from '../../store/slices/flowSlice';
import { formatMoney } from '../../utils/currency';
import { formatRangeShort, formatShort, weekLabel } from '../../utils/dateHelpers';

const DAY_OPTIONS: (30 | 60 | 90)[] = [30, 60, 90];

function iconForKind(kind: string): string {
  if (kind === 'income') return 'arrow-down-circle-outline';
  if (kind === 'card_due') return 'card-outline';
  if (kind === 'installment') return 'repeat-outline';
  if (kind === 'cycle_open_milestone') return 'sync-outline';
  return 'home-outline';
}

function colorForEvent(event: { kind: string; amount: string | null }): string {
  if (event.kind === 'income') return colors.accent;
  if (event.amount === null) return colors.textMuted;
  return colors.warning;
}

export default function FlowPage() {
  const dispatch = useAppDispatch();
  const { data, days, status, error } = useAppSelector((s) => s.flow);
  const loading = status === 'loading' && !data;

  useEffect(() => {
    dispatch(fetchFlowThunk(days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: 0 }}>Flujo</h1>
        <AddExpenseButton />
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchFlowThunk(days))} /> : null}

      <div
        style={{
          background: colors.surface,
          borderRadius: radius.card,
          padding: spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center' }}>Disponible Real a Fin de Mes</span>
        {loading ? (
          <Skeleton width={180} height={fontSize.amountLg} />
        ) : (
          <span
            style={{
              color: data && Number(data.ending_balance) < 0 ? colors.danger : colors.accent,
              fontSize: fontSize.amountLg,
              fontWeight: 800,
            }}
          >
            {data ? formatMoney(data.ending_balance) : '—'}
          </span>
        )}
        {data?.deficit_risk ? <Badge label="Riesgo de déficit proyectado" tone="danger" /> : null}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          background: colors.surface,
          borderRadius: radius.pill,
          padding: 4,
          marginBottom: spacing.md,
          width: 'fit-content',
          margin: `0 auto ${spacing.md}px`,
        }}
      >
        {DAY_OPTIONS.map((d) => {
          const active = days === d;
          return (
            <Pressable
              key={d}
              onClick={() => dispatch(fetchFlowThunk(d))}
              style={{
                padding: `${spacing.sm}px ${spacing.lg}px`,
                borderRadius: radius.pill,
                background: active ? colors.textPrimary : 'transparent',
                color: active ? colors.black : colors.textSecondary,
                fontWeight: 700,
                fontSize: fontSize.sm,
              }}
            >
              {d} D
            </Pressable>
          );
        })}
      </div>

      {data ? (
        <p style={{ color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginBottom: spacing.xl }}>
          Del {formatShort(data.as_of)} al {formatShort(data.until)}
        </p>
      ) : null}

      {loading ? (
        <>
          <SkeletonRow style={{ marginLeft: 44 }} />
          <SkeletonRow style={{ marginLeft: 44 }} />
          <SkeletonRow style={{ marginLeft: 44 }} />
        </>
      ) : !data || data.weeks.every((w) => w.events.length === 0) ? (
        <EmptyState icon="trending-up-outline" title="Sin movimientos proyectados" description="Cuando tengas tarjetas, ingresos o gastos fijos, aquí verás tu línea de tiempo." />
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: colors.divider }} />
          {data.weeks.map((week) => (
            <div key={week.week_index} style={{ marginBottom: spacing.xl }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md, position: 'relative' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: week.week_index === 0 ? colors.accent : colors.surfaceAlt,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconCircle name="calendar" bg="transparent" color={week.week_index === 0 ? colors.black : colors.textSecondary} size={20} />
                </div>
                <div>
                  <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800, margin: 0 }}>{weekLabel(week.week_index)}</p>
                  <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '1px 0 0' }}>{formatRangeShort(week.start, week.end)}</p>
                </div>
              </div>

              {week.events.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginLeft: 44, marginBottom: spacing.md }}>Sin movimientos esta semana</p>
              ) : null}

              {week.events.map((event, idx) => (
                <div
                  key={`${event.kind}-${event.date}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: colors.surface,
                    borderRadius: radius.card,
                    padding: spacing.lg,
                    marginLeft: 44,
                    marginBottom: spacing.md,
                  }}
                >
                  <IconCircle name={iconForKind(event.kind)} bg={colors.surfaceAlt} color={colorForEvent(event)} size={38} />
                  <div style={{ flex: 1, marginLeft: spacing.md }}>
                    <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{event.label}</p>
                    <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                      {formatShort(event.date)}
                      {event.kind === 'income' ? ' · Ingreso' : event.kind === 'installment' ? ' · MSI' : ' · Comprometido'}
                    </p>
                  </div>
                  {event.amount !== null ? (
                    <span style={{ color: Number(event.amount) > 0 ? colors.accent : colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>
                      {Number(event.amount) > 0 ? '+' : ''}
                      {formatMoney(event.amount)}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
