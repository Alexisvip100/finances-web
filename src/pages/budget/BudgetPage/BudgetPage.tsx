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

function Donut({
  segments,
  activeIndex,
  onSelectSegment,
  centerContent,
}: {
  segments: { color: string; fraction: number }[];
  activeIndex: number | null;
  onSelectSegment: (index: number | null) => void;
  centerContent: React.ReactNode;
}) {
  const size = DONUT_SIZE;
  const strokeWidth = DONUT_STROKE;
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;

  const computedSegments = segments.reduce<{ color: string; fraction: number; dash: number; offset: number }[]>(
    (acc, s) => {
      const prevSum = acc.reduce((sum, item) => sum + item.fraction, 0);
      const dash = circumference * s.fraction;
      const offset = circumference * (1 - prevSum);
      acc.push({ ...s, dash, offset });
      return acc;
    },
    []
  );

  const gap = segments.length > 1 ? 3 : 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={colors.surfaceAlt}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {computedSegments.map((s, idx) => {
          const isSelected = activeIndex === idx;
          const isAnySelected = activeIndex !== null;
          const visibleDash = Math.max(s.dash - gap, 2);

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radiusPx}
              stroke={s.color}
              strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
              opacity={isAnySelected && !isSelected ? 0.35 : 1}
              fill="none"
              strokeDasharray={`${visibleDash} ${circumference}`}
              strokeDashoffset={s.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, opacity 0.2s ease' }}
              onClick={() => onSelectSegment(isSelected ? null : idx)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: size - strokeWidth * 2 - 12,
          textAlign: 'center',
          pointerEvents: 'none',
          padding: 8,
        }}
      >
        {centerContent}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const {
    status,
    error,
    month,
    totalSpent,
    monthlyGoal,
    goalPercent,
    donutSegments,
    activeDonutIndex,
    setActiveDonutIndex,
    categoryFilter,
    setCategoryFilter,
    filteredCategories,
    counts,
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
              <Pressable onClick={handleSaveGoal} disabled={savingGoal} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.accent, color: colors.accentContrast, fontWeight: 700, fontSize: fontSize.sm }}>
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

      {/* Contenedor único de Distribución y Categorías */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', margin: 0 }}>
            {donutSegments.length > 0 ? 'Distribución de gastos' : 'Categorías'}
          </p>
          {activeDonutIndex !== null ? (
            <Pressable
              onClick={() => setActiveDonutIndex(null)}
              style={{ padding: '3px 10px', borderRadius: radius.pill, background: colors.surfaceAlt }}
            >
              <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>Ver total</span>
            </Pressable>
          ) : null}
        </div>

        {donutSegments.length > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing.sm}px 0 ${spacing.md}px` }}>
              <Donut
                segments={donutSegments}
                activeIndex={activeDonutIndex}
                onSelectSegment={setActiveDonutIndex}
                centerContent={(() => {
                  const activeSegment = activeDonutIndex !== null ? donutSegments[activeDonutIndex] : null;
                  if (activeSegment) {
                    return (
                      <>
                        <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                          {activeSegment.category.category_name}
                        </span>
                        <span style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, margin: '2px 0', lineHeight: 1.1 }}>
                          {formatMoney(activeSegment.category.spent)}
                        </span>
                        <span style={{ color: activeSegment.color, fontSize: fontSize.xs, fontWeight: 700 }}>
                          {Math.round(activeSegment.fraction * 100)}% del total
                        </span>
                      </>
                    );
                  }
                  return (
                    <>
                      <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Total gastado
                      </span>
                      <span style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, margin: '2px 0', lineHeight: 1.1 }}>
                        {formatMoney(totalSpent)}
                      </span>
                      <span style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                        {donutSegments.length} categorías con gasto
                      </span>
                    </>
                  );
                })()}
              />
            </div>
            <div style={{ height: 1, background: colors.divider, margin: `${spacing.md}px 0 ${spacing.lg}px` }} />
          </>
        ) : null}

        {/* Filtros rápidos en chips */}
        {counts.all > 0 ? (
          <div
            style={{
              display: 'flex',
              gap: spacing.xs,
              overflowX: 'auto',
              paddingBottom: spacing.sm,
              marginBottom: spacing.xs,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {[
              { id: 'all' as const, label: `Todas (${counts.all})` },
              { id: 'with_expense' as const, label: `Con gasto (${counts.withExpense})` },
              ...(counts.overBudget > 0 ? [{ id: 'over_budget' as const, label: `Límite superado (${counts.overBudget})` }] : []),
              ...(counts.withoutExpense > 0 ? [{ id: 'without_expense' as const, label: `Sin gasto (${counts.withoutExpense})` }] : []),
            ].map((chip) => {
              const active = categoryFilter === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  onClick={() => setCategoryFilter(chip.id)}
                  style={{
                    padding: `${spacing.xs}px ${spacing.md}px`,
                    borderRadius: radius.pill,
                    background: active ? colors.accent : colors.surfaceAlt,
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      color: active ? colors.accentContrast : colors.textSecondary,
                      fontSize: fontSize.xs,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {chip.label}
                  </span>
                </Pressable>
              );
            })}
          </div>
        ) : null}

        {/* Lista de categorías adentro del mismo container */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {counts.all === 0 && status !== 'loading' ? (
            <EmptyState icon="pie-chart-outline" title="Sin categorías" description="Crea categorías en Ajustes para organizar tus gastos." />
          ) : filteredCategories.length === 0 && status !== 'loading' ? (
            <div style={{ padding: `${spacing.lg}px 0`, textAlign: 'center' }}>
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, margin: 0 }}>
                No hay categorías en este filtro
              </p>
            </div>
          ) : null}

          {filteredCategories.map((c, idx) => {
            const isEditing = editingId === c.category_id;
            const limit = c.monthly_limit ? Number(c.monthly_limit) : null;
            const spent = Number(c.spent);
            const percent = limit && limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : null;

            const segmentIdx = donutSegments.findIndex((s) => {
              if (c.category_id != null && s.category.category_id != null) {
                return String(s.category.category_id) === String(c.category_id);
              }
              return s.category.category_name.toLowerCase().trim() === c.category_name.toLowerCase().trim();
            });
            const segmentInfo = segmentIdx !== -1 ? donutSegments[segmentIdx] : null;
            const isSelected = activeDonutIndex !== null && activeDonutIndex === segmentIdx;
            const sharePercent = segmentInfo ? Math.round(segmentInfo.fraction * 100) : 0;
            const isLast = idx === (filteredCategories.length - 1);

            return (
              <div
                key={c.category_id ?? c.category_name ?? idx}
                style={{
                  padding: `${spacing.md}px 0`,
                  borderBottom: isLast ? 'none' : `1px solid ${colors.divider}`,
                  background: isSelected ? colors.surfaceAlt : 'transparent',
                  borderRadius: isSelected ? radius.input : 0,
                  paddingLeft: isSelected ? spacing.sm : 0,
                  paddingRight: isSelected ? spacing.sm : 0,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    onClick={() => {
                      if (segmentIdx !== -1) {
                        setActiveDonutIndex(isSelected ? null : segmentIdx);
                      }
                    }}
                    style={{ cursor: segmentIdx !== -1 ? 'pointer' : 'default', position: 'relative' }}
                  >
                    <IconCircle
                      name={categoryIcons[c.category_name] ?? 'pricetag-outline'}
                      bg={colors.surfaceAlt}
                      color={segmentInfo?.color ?? colors.textSecondary}
                      size={36}
                    />
                    {segmentInfo ? (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          background: segmentInfo.color,
                          border: `2px solid ${colors.surface}`,
                        }}
                      />
                    ) : null}
                  </div>
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
                            <span style={{ color: colors.accentContrast, fontSize: fontSize.xs, fontWeight: 700 }}>{savingEdit ? 'Guardando…' : 'Guardar'}</span>
                          </Pressable>
                        </div>
                      </>
                    ) : (
                      <Pressable
                        onClick={() => {
                          setSelectedCategory(c);
                          if (segmentIdx !== -1) setActiveDonutIndex(segmentIdx);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
                          <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{c.category_name}</p>
                          {sharePercent > 0 ? (
                            <span style={{ fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: 700, background: colors.surfaceAlt, padding: '1px 6px', borderRadius: radius.pill }}>
                              {sharePercent}% del total
                            </span>
                          ) : null}
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
                  <div style={{ marginTop: spacing.md }}>
                    <ProgressBar percent={percent} color={percent >= 100 ? colors.danger : (segmentInfo?.color ?? colors.accent)} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
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
