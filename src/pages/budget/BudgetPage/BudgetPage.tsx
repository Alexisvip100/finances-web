import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { ProgressBar } from '../../../components/cards/ProgressBar';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { AddExpenseButton } from '../../../components/AddExpenseButton';
import { Pressable } from '../../../components/Pressable';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../../theme/theme';
import { formatMoney } from '../../../utils/currency';
import { monthKeyLabel } from '../../../utils/dateHelpers';
import CategoryTransactionsSheet from '../CategoryTransactionsSheet';
import {
  DONUT_SIZE,
  DONUT_STROKE,
  editInputStyle,
  iconBtnStyle,
  styles,
} from './BudgetPage.styles';
import { useBudgetPage } from './BudgetPage.hooks';

function Donut({ segments }: { segments: { color: string; fraction: number }[] }) {
  const size = DONUT_SIZE;
  const strokeWidth = DONUT_STROKE;
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  let cumulative = 0;

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={radiusPx} stroke={colors.surfaceAlt} strokeWidth={strokeWidth} fill="none" />
      {segments.map((s, idx) => {
        const fraction = s.fraction;
        const dash = circumference * fraction;
        const offset = circumference * (1 - cumulative);
        cumulative += fraction;
        return (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={radiusPx}
            stroke={s.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

export default function BudgetPage() {
  const {
    data,
    status,
    error,
    month,
    totalSpent,
    monthlyGoal,
    goalPercent,
    donutSegments,
    selectedCategory,
    editingId,
    editingName,
    editingLimit,
    savingEdit,
    deletingId,
    editingGoal,
    goalInput,
    savingGoal,
    setSelectedCategory,
    setEditingGoal,
    setGoalInput,
    setEditingName,
    setEditingLimit,
    startEdit,
    cancelEdit,
    saveEdit,
    handleDelete,
    handleSaveGoal,
    handlePrevMonth,
    handleNextMonth,
    refresh,
  } = useBudgetPage();

  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: 0 }}>Presupuesto</h1>
        <AddExpenseButton />
      </div>

      <div style={styles.monthRow}>
        <Pressable onClick={handlePrevMonth} style={styles.monthArrow}>
          <Icon name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <span style={styles.monthLabel}>{monthKeyLabel(month)}</span>
        <Pressable onClick={handleNextMonth} style={styles.monthArrow}>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </div>

      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}

      {/* Meta de gasto general */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Meta mensual
          </span>
          {!editingGoal ? (
            <Pressable
              onClick={() => {
                setGoalInput(monthlyGoal ? String(monthlyGoal) : '');
                setEditingGoal(true);
              }}
              style={iconBtnStyle}
            >
              <Icon name="pencil-outline" size={14} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </div>

        {editingGoal ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, margin: `${spacing.sm}px 0` }}>
              <span style={{ color: colors.accent, fontSize: fontSize.xl, fontWeight: 800 }}>$</span>
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="Ej. 15000"
                autoFocus
                style={{ ...editInputStyle, fontSize: fontSize.xl, fontWeight: 800, flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.md }}>
              <Pressable onClick={() => setEditingGoal(false)} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.surfaceAlt, color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>
                Cancelar
              </Pressable>
              <Pressable onClick={handleSaveGoal} disabled={savingGoal} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.accent, color: colors.black, fontWeight: 700, fontSize: fontSize.sm }}>
                {savingGoal ? 'Guardando…' : 'Guardar'}
              </Pressable>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm }}>
              <div>
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: 0 }}>Gastado este mes</p>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: '2px 0 0' }}>{formatMoney(totalSpent)}</p>
              </div>
              {monthlyGoal ? (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: 0 }}>Meta</p>
                  <p style={{ color: colors.textSecondary, fontSize: fontSize.md, fontWeight: 700, margin: '2px 0 0' }}>{formatMoney(monthlyGoal)}</p>
                </div>
              ) : null}
            </div>
            {goalPercent !== null ? (
              <>
                <ProgressBar percent={goalPercent} color={goalPercent >= 100 ? colors.danger : colors.accent} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ color: goalPercent >= 100 ? colors.danger : colors.textSecondary, fontSize: fontSize.xs, fontWeight: 600 }}>
                    {goalPercent}% gastado
                  </span>
                  {monthlyGoal ? (
                    <span style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                      {monthlyGoal - totalSpent > 0 ? `${formatMoney(monthlyGoal - totalSpent)} restante` : 'Excedido'}
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: 0 }}>Toca el lápiz para fijar una meta mensual</p>
            )}
          </div>
        )}
      </div>

      {/* Gráfico circular */}
      {donutSegments.length > 0 ? (
        <div style={styles.card}>
          <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', margin: `0 0 ${spacing.lg}px` }}>
            Distribución de gastos
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spacing.lg }}>
            <Donut segments={donutSegments} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' }}>
            {donutSegments.map((s) => (
              <div key={s.category.category_id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                <span style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                  {s.category.category_name} ({Math.round(s.fraction * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Lista de categorías */}
      <div style={{ marginTop: spacing.xl }}>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: spacing.md }}>
          Por categoría
        </p>

        {data && data.categories.length === 0 && status !== 'loading' ? (
          <EmptyState icon="pie-chart-outline" title="Sin categorías" description="Crea categorías en Ajustes para organizar tus gastos." />
        ) : null}

        {data?.categories.map((c) => {
          const isEditing = editingId === c.category_id;
          const limit = c.monthly_limit ? Number(c.monthly_limit) : null;
          const spent = Number(c.spent);
          const percent = limit && limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : null;

          return (
            <div key={c.category_id} style={styles.categoryCard}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.md }}>
                <IconCircle
                  name={categoryIcons[c.category_name] ?? 'pricetag-outline'}
                  bg={colors.surfaceAlt}
                  color={colors.textSecondary}
                  size={36}
                />
                <div style={{ flex: 1, marginLeft: spacing.md }}>
                  {isEditing ? (
                    <>
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Nombre de categoría"
                        autoFocus
                        style={{ ...editInputStyle, fontSize: fontSize.md, fontWeight: 700, width: '100%' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ color: colors.accent, fontWeight: 700, marginRight: 2 }}>$</span>
                        <input
                          value={editingLimit}
                          onChange={(e) => setEditingLimit(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder="Límite mensual"
                          style={{ ...editInputStyle, fontSize: fontSize.sm, fontWeight: 700, flex: 1 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.sm }}>
                        <Pressable onClick={cancelEdit} style={{ padding: `${spacing.xs}px ${spacing.md}px`, borderRadius: radius.pill, background: colors.surfaceAlt }}>
                          <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700 }}>Cancelar</span>
                        </Pressable>
                        <Pressable onClick={saveEdit} disabled={savingEdit} style={{ padding: `${spacing.xs}px ${spacing.md}px`, borderRadius: radius.pill, background: colors.accent }}>
                          <span style={{ color: colors.black, fontSize: fontSize.xs, fontWeight: 700 }}>{savingEdit ? 'Guardando…' : 'Guardar'}</span>
                        </Pressable>
                      </div>
                    </>
                  ) : (
                    <Pressable onClick={() => setSelectedCategory(c)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{c.category_name}</p>
                        {percent !== null && percent >= 100 ? <Badge label="Excedido" tone="danger" /> : null}
                      </div>
                      <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                        {limit ? `Límite: ${formatMoney(limit)}` : 'Sin límite fijado'}
                      </p>
                    </Pressable>
                  )}
                </div>

                {!isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>{formatMoney(spent)}</span>
                    <Pressable onClick={() => startEdit(c.category_id, c.category_name, c.monthly_limit)} style={iconBtnStyle}>
                      <Icon name="pencil-outline" size={15} color={colors.textMuted} />
                    </Pressable>
                    <Pressable onClick={() => handleDelete(c.category_id)} disabled={deletingId === c.category_id} style={iconBtnStyle}>
                      <Icon name="trash-outline" size={15} color={colors.danger} />
                    </Pressable>
                  </div>
                ) : null}
              </div>

              {percent !== null ? (
                <div style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
                  <ProgressBar percent={percent} color={percent >= 100 ? colors.danger : colors.accent} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectedCategory ? (
        <CategoryTransactionsSheet
          categoryId={selectedCategory.category_id}
          categoryName={selectedCategory.category_name}
          month={month}
          onClose={() => setSelectedCategory(null)}
        />
      ) : null}
    </PageShell>
  );
}
