import React, { useEffect } from 'react';
import { PageShell } from '../../../components/PageShell';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { Skeleton, SkeletonCircle } from '../../../components/Skeleton';
import { AddExpenseButton } from '../../../components/AddExpenseButton';
import { Pressable } from '../../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchFlowThunk } from '../../../store/slices/flowSlice';
import { formatMoney } from '../../../utils/currency';
import { formatRangeShort, formatShort, weekLabel } from '../../../utils/dateHelpers';
import { DAY_OPTIONS, dynamicStyles, styles } from './FlowPage.styles';

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
  }, [days, dispatch]);

  return (
    <PageShell>
      <div style={styles.headerRow}>
        <h1 style={styles.headerTitle}>Flujo</h1>
        <AddExpenseButton />
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchFlowThunk(days))} /> : null}

      <div style={styles.summaryCard}>
        <span style={styles.summaryTitle}>Disponible Real a Fin de Mes</span>
        {loading ? (
          <Skeleton width={180} height={Math.round(fontSize.amountLg * 1.1)} />
        ) : (
          <span style={dynamicStyles.balanceText(Boolean(data && Number(data.ending_balance) < 0))}>
            {data ? formatMoney(data.ending_balance) : '—'}
          </span>
        )}
        {data?.deficit_risk ? <Badge label="Riesgo de déficit proyectado" tone="danger" /> : null}
      </div>

      <div style={styles.daysFilter}>
        {DAY_OPTIONS.map((d) => {
          const active = days === d;
          return (
            <Pressable
              key={d}
              onClick={() => dispatch(fetchFlowThunk(d))}
              style={dynamicStyles.dayOption(active)}
            >
              {d} D
            </Pressable>
          );
        })}
      </div>

      {data ? (
        <p style={styles.rangeText}>
          Del {formatShort(data.as_of)} al {formatShort(data.until)}
        </p>
      ) : null}

      {loading ? (
        <div style={styles.timeline}>
          <div style={styles.timelineLine} />
          {[0, 1].map((week) => (
            <div key={week} style={{ marginBottom: spacing.xl }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                <SkeletonCircle size={32} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width={90} height={15} />
                  <Skeleton width={70} height={11} />
                </div>
              </div>
              {[0, 1].map((row) => (
                <div
                  key={row}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: colors.surface,
                    borderRadius: radius.card,
                    padding: spacing.lg,
                    marginLeft: 44,
                    marginBottom: spacing.md,
                    gap: spacing.md,
                  }}
                >
                  <SkeletonCircle size={38} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton width="55%" height={15} />
                    <Skeleton width="35%" height={11} />
                  </div>
                  <Skeleton width={64} height={15} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : !data || data.weeks.every((w) => w.events.length === 0) ? (
        <EmptyState icon="trending-up-outline" title="Sin movimientos proyectados" description="Cuando tengas tarjetas, ingresos o gastos fijos, aquí verás tu línea de tiempo." />
      ) : (
        <div style={styles.timeline}>
          <div style={styles.timelineLine} />
          {data.weeks.map((week) => (
            <div key={week.week_index} style={{ marginBottom: spacing.xl }}>
              <div style={styles.weekRow}>
                <div style={dynamicStyles.weekBadge(week.week_index === 0)}>
                  <IconCircle name="calendar" bg="transparent" color={week.week_index === 0 ? colors.black : colors.textSecondary} size={20} />
                </div>
                <div>
                  <p style={styles.weekTitle}>{weekLabel(week.week_index)}</p>
                  <p style={styles.weekRange}>{formatRangeShort(week.start, week.end)}</p>
                </div>
              </div>

              {week.events.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginLeft: 44, marginBottom: spacing.md }}>Sin movimientos esta semana</p>
              ) : null}

              {week.events.map((event, idx) => (
                <div
                  key={`${event.kind}-${event.date}-${idx}`}
                  style={styles.eventRow}
                >
                  <IconCircle name={iconForKind(event.kind)} bg={colors.surfaceAlt} color={colorForEvent(event)} size={38} />
                  <div style={{ flex: 1, marginLeft: spacing.md }}>
                    <p style={styles.eventLabel}>{event.label}</p>
                    <p style={styles.eventMeta}>
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
