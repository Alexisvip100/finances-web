import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { Card } from '../../../components/Card';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { AddExpenseButton } from '../../../components/AddExpenseButton';
import { MetricCard } from '../../../components/cards/MetricCard';
import { ProgressBar } from '../../../components/cards/ProgressBar';
import { EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { colors, fontSize, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchCardDetailThunk, fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { formatMoney } from '../../../utils/currency';
import { formatShort } from '../../../utils/dateHelpers';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { styles } from './CardsListPage.styles';

export default function CardsListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, detailById, status, error } = useAppSelector((s) => s.cards);
  const accounts = useAppSelector((s) => s.accounts.items);
  const debitCards = accounts.filter((a) => a.type === 'DEBIT');

  useEffect(() => {
    dispatch(fetchCardsThunk());
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    items.forEach((c) => dispatch(fetchCardDetailThunk(c.id)));
  }, [items, dispatch]);

  const totals = useMemo(() => {
    let committed = 0;
    let allocated = 0;
    items.forEach((c) => {
      const detail = detailById[c.id];
      if (detail?.pending_cycle) {
        committed += Number(detail.pending_cycle.total_amount) - Number(detail.pending_cycle.paid_amount);
      }
      if (detail) allocated += Number(detail.allocated_for_pending_cycle);
    });
    return { committed, allocated };
  }, [items, detailById]);

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <div style={styles.headerRow}>
        <p style={styles.headerTitle}>Tarjetas</p>
        <AddExpenseButton />
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchCardsThunk())} /> : null}

      {items.length > 0 ? (
        <div style={styles.metricsRow}>
          <MetricCard
            label="Total comprometido"
            value={formatMoney(totals.committed)}
            valueColor={colors.warning}
            amountSize="amountSm"
            trailing={<Icon name="warning-outline" size={16} color={colors.warning} />}
            style={{ flex: 1 }}
          />
          <MetricCard
            label="Total apartado"
            value={formatMoney(totals.allocated)}
            valueColor={colors.accent}
            amountSize="amountSm"
            trailing={<Icon name="checkmark-circle-outline" size={16} color={colors.accent} />}
            style={{ flex: 1 }}
          />
        </div>
      ) : null}

      {items.length === 0 && debitCards.length === 0 && status !== 'loading' ? (
        <EmptyState
          icon="card-outline"
          title="Sin tarjetas todavía"
          description="Agrega tu primera tarjeta para que Ciclos calcule su periodo de facturación y fecha de pago."
          actionLabel="Agregar tarjeta"
          onAction={() => navigate('/tarjetas/nueva')}
        />
      ) : (
        <>
          {debitCards.length > 0 ? (
            <>
              <p style={styles.sectionLabel}>TARJETAS DE DÉBITO</p>
              {debitCards.map((account) => (
                <Card
                  key={`debit-${account.id}`}
                  onPress={() => navigate(`/ajustes/cuentas/${account.id}`)}
                  style={{ marginBottom: spacing.lg }}
                >
                  <div style={styles.cardHeader}>
                    <IconCircle name="card" bg={colors.surfaceAlt} color={account.color ?? colors.accent} size={40} />
                    <div style={{ flex: 1, marginLeft: spacing.md }}>
                      <p style={styles.cardName}>{accountLabel(account)}</p>
                      <p style={styles.cardMeta}>{account.bank ?? 'Débito'}</p>
                    </div>
                    <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>{formatMoney(account.balance)}</span>
                  </div>
                </Card>
              ))}
            </>
          ) : null}

          {items.length > 0 ? <p style={styles.sectionLabel}>TARJETAS DE CRÉDITO</p> : null}
          {items.map((card) => {
            const detail = detailById[card.id];
            const pending = detail?.pending_cycle;
            const remaining = pending ? Number(pending.total_amount) - Number(pending.paid_amount) : 0;
            const allocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;
            const allocatedPercent = remaining > 0 ? Math.min(100, Math.round((allocated / remaining) * 100)) : 0;

            return (
              <Card key={card.id} onPress={() => navigate(`/tarjetas/${card.id}`)} style={{ marginBottom: spacing.lg }}>
                <div style={styles.cardHeader}>
                  <IconCircle name="card" bg={colors.surfaceAlt} color={card.color ?? colors.accent} size={40} />
                  <div style={{ flex: 1, marginLeft: spacing.md }}>
                    <p style={styles.cardName}>
                      {cardLabel(card)} ••••{card.last_four}
                    </p>
                    <p style={styles.cardMeta}>
                      Ciclo abierto: {detail?.current_cycle ? formatMoney(detail.current_cycle.total_amount) : '—'}
                    </p>
                    {detail ? <p style={styles.cardMeta}>Disponible: {formatMoney(detail.available_credit)}</p> : null}
                  </div>
                  {!pending && detail?.last_paid_cycle ? (
                    <div style={styles.paidBadge}>
                      <Icon name="checkmark-circle" size={14} color={colors.accent} />
                      <span style={styles.paidBadgeLabel}>Pagado</span>
                    </div>
                  ) : null}
                </div>

                {pending ? (
                  <>
                    <div style={styles.divider} />
                    <div style={styles.pendingHeader}>
                      <div>
                        <p style={styles.pendingLabel}>POR PAGAR</p>
                        <p style={styles.pendingAmount}>{formatMoney(remaining)}</p>
                      </div>
                      <div style={styles.pendingDueBadge}>
                        <span style={{ color: colors.danger, fontSize: fontSize.xs, fontWeight: 700 }}>{formatShort(pending.due_date)}</span>
                      </div>
                    </div>
                    <div style={styles.allocatedRow}>
                      <p style={styles.pendingLabel}>APARTADO</p>
                      <span style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: 700 }}>
                        {formatMoney(allocated)} / {formatMoney(remaining)}
                      </span>
                    </div>
                    <ProgressBar percent={allocatedPercent} color={colors.accent} />
                  </>
                ) : null}
              </Card>
            );
          })}
        </>
      )}

      <Pressable
        onClick={() => navigate('/tarjetas/nueva')}
        style={styles.addCardBtn}
      >
        <Icon name="add" size={16} color={colors.textSecondary} style={{ marginRight: spacing.sm }} />
        <span style={{ color: colors.textSecondary, fontWeight: 700 }}>Agregar tarjeta</span>
      </Pressable>
    </PageShell>
  );
}
