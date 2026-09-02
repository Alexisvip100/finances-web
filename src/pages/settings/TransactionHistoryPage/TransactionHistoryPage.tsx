import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Portal } from '../../../components/Portal';
import { Pressable } from '../../../components/Pressable';
import { colors, categoryIcons, spacing } from '../../../theme/theme';
import { formatMoney } from '../../../utils/currency';
import { formatShort } from '../../../utils/dateHelpers';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { styles } from './TransactionHistoryPage.styles';
import { useTransactionHistoryPage } from './TransactionHistoryPage.hooks';

export default function TransactionHistoryPage() {
  const {
    navigate,
    categories,
    cards,
    activeFixedExpenses,
    error,
    granularity,
    categoryId,
    categoryPickerOpen,
    source,
    method,
    onlyFixed,
    paidFixedIds,
    markingPaidId,
    categoryById,
    selectedCategory,
    debitAccounts,
    sourceLabel,
    total,
    groupedByDay,
    periodLabel,
    hasActiveFilters,
    methodOptions,
    setGranularity,
    setCategoryId,
    setCategoryPickerOpen,
    setSource,
    setOnlyFixed,
    handleMethodChange,
    changePeriod,
    handleMarkPaid,
    handleDeleteTxn,
    refresh,
  } = useTransactionHistoryPage();

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <TopBar title="Historial de compras" onBack={() => navigate(-1)} />
      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

      <div style={styles.segmentedRow}>
        {(['month', 'week', 'day'] as const).map((g) => {
          const active = granularity === g;
          const label = g === 'month' ? 'Mes' : g === 'week' ? 'Semana' : 'Día';
          return (
            <Pressable
              key={g}
              onClick={() => setGranularity(g)}
              style={{ ...styles.segmentBtn, ...(active ? styles.segmentBtnActive : {}) }}
            >
              <span style={{ ...styles.segmentLabel, ...(active ? styles.segmentLabelActive : {}) }}>{label}</span>
            </Pressable>
          );
        })}
      </div>

      <div style={styles.periodRow}>
        <Pressable onClick={() => changePeriod(-1)} style={styles.periodArrow}>
          <Icon name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <span style={styles.periodLabel}>{periodLabel}</span>
        <Pressable onClick={() => changePeriod(1)} style={styles.periodArrow}>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </div>

      <div style={styles.totalCard}>
        <span style={styles.totalLabel}>TOTAL DEL PERIODO</span>
        <span style={styles.totalValue}>{formatMoney(total)}</span>
        {hasActiveFilters ? <span style={styles.totalMeta}>Con filtros aplicados</span> : null}
      </div>

      {granularity === 'month' && activeFixedExpenses.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Gastos fijos este mes</p>
          {activeFixedExpenses.map((fixed) => {
            const isPaid = paidFixedIds.has(fixed.id);
            const isMarking = markingPaidId === fixed.id;
            return (
              <div key={fixed.id} style={styles.fixedRow}>
                <IconCircle name="calendar-outline" bg={colors.surfaceAlt} color={colors.textSecondary} size={36} />
                <div style={{ flex: 1, marginLeft: spacing.md }}>
                  <p style={styles.txnLabel}>{fixed.name}</p>
                  <p style={styles.txnMeta}>
                    Día {fixed.day_of_month} · {formatMoney(fixed.amount)}
                  </p>
                </div>
                {isPaid ? (
                  <div style={styles.paidBadge}>
                    <Icon name="checkmark-circle" size={14} color={colors.accent} />
                    <span style={styles.paidBadgeLabel}>Pagado</span>
                  </div>
                ) : (
                  <Pressable style={styles.payBtn} onClick={() => handleMarkPaid(fixed)} disabled={isMarking}>
                    <span style={styles.payBtnLabel}>{isMarking ? 'Guardando…' : 'Marcar pagado'}</span>
                  </Pressable>
                )}
              </div>
            );
          })}
        </>
      ) : null}

      <p style={styles.filterLabel}>Filtrar por categoría</p>
      <div style={styles.chipsRow}>
        <Chip label={selectedCategory ? selectedCategory.name : 'Todas las categorías'} active={categoryId !== null} onPress={() => setCategoryPickerOpen(true)} />
        {categoryId !== null ? <Chip label="Limpiar categoría" active={false} onPress={() => setCategoryId(null)} /> : null}
      </div>

      <p style={styles.filterLabel}>Filtrar por método</p>
      <div style={styles.chipsRow}>
        {methodOptions.map((opt) => (
          <Chip key={opt.label} label={opt.label} active={method === opt.value} onPress={() => handleMethodChange(opt.value)} />
        ))}
      </div>

      {method === 'DEBIT' && debitAccounts.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Cuenta de débito</p>
          <div style={styles.chipsRow}>
            <Chip label="Todas" active={source === null} onPress={() => setSource(null)} />
            {debitAccounts.map((a) => (
              <Chip
                key={a.id}
                label={accountLabel(a)}
                active={source?.kind === 'account' && source.id === a.id}
                onPress={() => setSource({ kind: 'account', id: a.id })}
              />
            ))}
          </div>
        </>
      ) : null}

      {method === 'CREDIT' && cards.length > 0 ? (
        <>
          <p style={styles.filterLabel}>Tarjeta de crédito</p>
          <div style={styles.chipsRow}>
            <Chip label="Todas" active={source === null} onPress={() => setSource(null)} />
            {cards.map((c) => (
              <Chip
                key={c.id}
                label={`${cardLabel(c)} ••••${c.last_four}`}
                active={source?.kind === 'card' && source.id === c.id}
                onPress={() => setSource({ kind: 'card', id: c.id })}
              />
            ))}
          </div>
        </>
      ) : null}

      <div style={{ marginTop: spacing.md }}>
        <Chip label={onlyFixed ? 'Solo gastos fijos (activo)' : 'Solo gastos fijos'} active={onlyFixed} onPress={() => setOnlyFixed((v) => !v)} />
      </div>

      <div style={styles.divider} />

      {groupedByDay.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="Sin compras en este periodo"
          description={hasActiveFilters ? 'No hay compras que coincidan con los filtros seleccionados.' : 'Registra tus gastos para verlos organizados aquí.'}
        />
      ) : (
        groupedByDay.map(([date, txns]) => (
          <div key={date} style={{ marginBottom: spacing.lg }}>
            <p style={styles.dayHeader}>{formatShort(date)}</p>
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
                      {sourceLabel(t)}
                      {t.fixed_expense_id !== null ? ' · Fijo' : ''}
                    </p>
                  </div>
                  <span style={styles.txnValue}>{formatMoney(t.amount)}</span>
                  <Pressable onClick={() => handleDeleteTxn(t.id)} style={styles.deleteBtn}>
                    <Icon name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                </div>
              );
            })}
          </div>
        ))
      )}

      {categoryPickerOpen ? (
        <Portal>
          <div style={styles.modalBackdrop}>
            <div onClick={() => setCategoryPickerOpen(false)} style={styles.modalOverlay} />
            <div style={styles.modalSheet}>
              <div style={styles.modalHeader}>
                <p style={styles.modalTitle}>Filtrar por categoría</p>
                <Pressable onClick={() => setCategoryPickerOpen(false)} style={{ padding: 4 }}>
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </div>
              <div style={styles.modalList}>
                <Pressable
                  onClick={() => {
                    setCategoryId(null);
                    setCategoryPickerOpen(false);
                  }}
                  style={styles.modalRow}
                >
                  <span style={styles.modalRowLabel}>Todas</span>
                  {categoryId === null ? <Icon name="checkmark" size={16} color={colors.accent} /> : null}
                </Pressable>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      setCategoryPickerOpen(false);
                    }}
                    style={styles.modalRow}
                  >
                    <Icon name={categoryIcons[c.name] ?? 'pricetag-outline'} size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <span style={styles.modalRowLabel}>{c.name}</span>
                    {categoryId === c.id ? <Icon name="checkmark" size={16} color={colors.accent} /> : null}
                  </Pressable>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
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
