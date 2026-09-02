import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, spacing } from '../../../theme/theme';
import { formatMoney } from '../../../utils/currency';
import { formatShort, monthKeyLabel } from '../../../utils/dateHelpers';
import { styles } from './IncomeHistoryPage.styles';
import { useIncomeHistoryPage } from './IncomeHistoryPage.hooks';

export default function IncomeHistoryPage() {
  const {
    navigate,
    incomes,
    activeIncomes,
    incomeById,
    error,
    month,
    incomeFilter,
    receipts,
    total,
    groupedByDay,
    markingId,
    paidIncomeIds,
    deletingReceiptId,
    setIncomeFilter,
    changeMonth,
    handleMarkPaid,
    handleDeleteReceipt,
    refresh,
  } = useIncomeHistoryPage();

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
