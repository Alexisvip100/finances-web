import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, SecondaryButton } from '../../../components/Buttons';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { Portal } from '../../../components/Portal';
import { ProgressBar } from '../../../components/cards/ProgressBar';
import { CycleRing } from '../../../components/cards/CycleRing';
import { ErrorBanner, IconCircle } from '../../../components/Misc';
import { colors, categoryIcons, fontSize, spacing } from '../../../theme/theme';
import { Transaction } from '../../../types';
import { formatMoney } from '../../../utils/currency';
import { formatShort, formatRelativeToToday } from '../../../utils/dateHelpers';
import { styles } from './CardDetailPage.styles';
import { useCardDetailPage } from './CardDetailPage.hooks';

export default function CardDetailPage() {
  const {
    cardId,
    navigate,
    detail,
    error,
    categoryById,
    cycle,
    pending,
    paidCycle,
    pendingRemaining,
    allocated,
    allocatedPercent,
    totalCycleDays,
    currentDayIndex,
    groupedByDay,
    groupedPaidCycleTransactions,
    paidCycleModalOpen,
    currentCycleModalOpen,
    setPaidCycleModalOpen,
    setCurrentCycleModalOpen,
    openPaidCycleModal,
    openCurrentCycleModal,
    handleDeleteTxn,
  } = useCardDetailPage();

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
                  <Icon name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              ) : null}
            </div>
          );
        })}
      </div>
    ));

  return (
    <PageShell contentStyle={{ paddingBottom: 120 }}>
      <TopBar
        title={detail?.name ?? 'Tarjeta'}
        onBack={() => navigate(-1)}
        right={
          <Pressable onClick={() => navigate(`/tarjetas/${cardId}/editar`)} style={{ padding: spacing.xs }}>
            <Icon name="pencil-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {/* Ciclo actual / abierto */}
      <div style={styles.card}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <span style={styles.sectionTitle}>Ciclo actual</span>
            <p style={styles.amountLarge}>{cycle ? formatMoney(cycle.total_amount) : '—'}</p>
            {cycle ? (
              <p style={styles.cycleDates}>
                {formatShort(cycle.start_date)} – {formatShort(cycle.end_date)}
              </p>
            ) : null}
            {detail ? (
              <p style={styles.creditLimit}>
                Límite: {formatMoney(detail.credit_limit)} · Disp: {formatMoney(detail.available_credit)}
              </p>
            ) : null}
          </div>
          <CycleRing dayIndex={currentDayIndex} totalDays={totalCycleDays} size={84} strokeWidth={8} />
        </div>

        {groupedByDay.length > 0 ? (
          <Pressable onClick={openCurrentCycleModal} style={{ marginTop: spacing.md }}>
            <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>
              Ver compras de este ciclo ({cycleTransactionsCount(groupedByDay)}) →
            </span>
          </Pressable>
        ) : null}
      </div>

      {/* Ciclo cerrado pendiente de pago */}
      {pending ? (
        <div style={styles.pendingCard}>
          <div style={styles.pendingHeader}>
            <div>
              <p style={styles.pendingTitle}>POR PAGAR (CORTE ANTERIOR)</p>
              <p style={styles.pendingAmount}>{formatMoney(pendingRemaining)}</p>
            </div>
            <div style={styles.dueBadge}>
              <span style={styles.dueText}>Vence {formatRelativeToToday(pending.due_date)}</span>
            </div>
          </div>

          <div style={styles.allocatedRow}>
            <p style={styles.pendingTitle}>APARTADO</p>
            <span style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: 700 }}>
              {formatMoney(allocated)} / {formatMoney(pendingRemaining)}
            </span>
          </div>
          <ProgressBar percent={allocatedPercent} color={colors.accent} />

          <div style={styles.buttonRow}>
            <SecondaryButton
              label="Apartar dinero"
              onPress={() => navigate(`/tarjetas/${cardId}/apartar`)}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Registrar pago"
              onPress={() => navigate(`/tarjetas/${cardId}/pagar`)}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      ) : null}

      {/* Último ciclo pagado */}
      {paidCycle ? (
        <Pressable onClick={openPaidCycleModal} style={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <IconCircle name="checkmark-circle" bg={colors.accentMuted} color={colors.accent} size={36} />
            <div style={{ flex: 1, marginLeft: spacing.md }}>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>
                Último ciclo pagado
              </p>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                Corte {formatShort(paidCycle.end_date)} · {formatMoney(paidCycle.total_amount)}
              </p>
            </div>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </div>
        </Pressable>
      ) : null}

      {/* Meses sin intereses */}
      {detail && detail.installment_plans.length > 0 ? (
        <div style={{ marginTop: spacing.xl }}>
          <p style={styles.sectionHeader}>Planes a meses sin intereses</p>
          {detail.installment_plans.map((p) => {
            const progress = Math.min(100, Math.round((p.months_paid / p.months_total) * 100));
            return (
              <div key={p.id} style={styles.planCard}>
                <div style={styles.planHeader}>
                  <p style={styles.planDesc}>{p.description}</p>
                  <span style={styles.planMonthly}>{formatMoney(p.monthly_amount)}/mes</span>
                </div>
                <div style={styles.planMeta}>
                  <span style={styles.planMetaText}>
                    {p.months_paid} de {p.months_total} meses pagados
                  </span>
                  <span style={styles.planMetaText}>Total: {formatMoney(p.total_amount)}</span>
                </div>
                <ProgressBar percent={progress} color={colors.accent} />
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Modal ciclo actual */}
      {currentCycleModalOpen ? (
        <Portal>
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalSheet, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>
                    Compras de este ciclo
                  </p>
                  {cycle ? (
                    <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                      {formatShort(cycle.start_date)} – {formatShort(cycle.end_date)}
                    </p>
                  ) : null}
                </div>
                <Pressable
                  onClick={() => setCurrentCycleModalOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: 16, background: colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </Pressable>
              </div>
              <div style={{ overflowY: 'auto', padding: spacing.lg, flex: 1 }}>
                {groupedByDay.length === 0 ? (
                  <p style={{ color: colors.textMuted, textAlign: 'center', margin: '32px 0' }}>
                    Sin compras en este ciclo todavía.
                  </p>
                ) : (
                  renderTxnGroups(groupedByDay, true)
                )}
              </div>
            </div>
          </div>
        </Portal>
      ) : null}

      {/* Modal ciclo pagado */}
      {paidCycleModalOpen ? (
        <Portal>
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalSheet, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>
                    Ciclo pagado
                  </p>
                  {paidCycle ? (
                    <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                      Corte {formatShort(paidCycle.end_date)} · Total {formatMoney(paidCycle.total_amount)}
                    </p>
                  ) : null}
                </div>
                <Pressable
                  onClick={() => setPaidCycleModalOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: 16, background: colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </Pressable>
              </div>
              <div style={{ overflowY: 'auto', padding: spacing.lg, flex: 1 }}>
                {groupedPaidCycleTransactions.length === 0 ? (
                  <p style={{ color: colors.textMuted, textAlign: 'center', margin: '32px 0' }}>
                    Sin detalle disponible para este ciclo.
                  </p>
                ) : (
                  renderTxnGroups(groupedPaidCycleTransactions, false)
                )}
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </PageShell>
  );
}

function cycleTransactionsCount(groups: [string, Transaction[]][]) {
  return groups.reduce((acc, [, txns]) => acc + txns.length, 0);
}
