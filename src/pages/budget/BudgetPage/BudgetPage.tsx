import React, { useEffect, useMemo, useState } from 'react';
import { PageShell } from '../../../components/PageShell';
import { ProgressBar } from '../../../components/cards/ProgressBar';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { AddExpenseButton } from '../../../components/AddExpenseButton';
import { Pressable } from '../../../components/Pressable';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchBudgetThunk, setMonth } from '../../../store/slices/budgetSlice';
import { deleteCategoryThunk, updateCategoryThunk } from '../../../store/slices/categoriesSlice';
import { updateSpendingGoalThunk } from '../../../store/slices/authSlice';
import { formatMoney } from '../../../utils/currency';
import { formatShort, monthKeyLabel, shiftMonthKey } from '../../../utils/dateHelpers';
import { CategoryTransactionsSheet } from '../CategoryTransactionsSheet';
import type { CategoryBudget } from '../../../types';
import {
  DONUT_COLORS,
  DONUT_SIZE,
  DONUT_STROKE,
  dynamicStyles,
  editInputStyle,
  iconBtnStyle,
  styles,
} from './BudgetPage.styles';

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
  const dispatch = useAppDispatch();
  const { data, status, error, month } = useAppSelector((s) => s.budget);

  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLimit, setEditingLimit] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    dispatch(fetchBudgetThunk(month));
  }, [dispatch, month]);

  const totalSpent = useMemo(() => {
    if (!data) return 0;
    return data.categories.reduce((acc, c) => acc + Number(c.spent), 0);
  }, [data]);

  const monthlyGoal = data?.spending_goal ? Number(data.spending_goal) : null;
  const goalPercent = monthlyGoal && monthlyGoal > 0 ? Math.round((totalSpent / monthlyGoal) * 100) : null;

  const donutSegments = useMemo(() => {
    if (!data || totalSpent === 0) return [];
    return data.categories
      .filter((c) => Number(c.spent) > 0)
      .map((c, i) => ({
        category: c,
        fraction: Number(c.spent) / totalSpent,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
  }, [data, totalSpent]);

  const startEdit = (id: number | null, name: string, limit: string | null) => {
    if (id === null) return;
    setEditingId(id);
    setEditingName(name);
    setEditingLimit(limit ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (editingId === null || !editingName.trim()) return;
    setSavingEdit(true);
    try {
      await dispatch(
        updateCategoryThunk({
          id: editingId,
          payload: { name: editingName.trim(), monthly_limit: editingLimit || undefined },
        })
      ).unwrap();
      dispatch(fetchBudgetThunk(month));
      setEditingId(null);
    } catch {
      // slice
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: number | null) => {
    if (id === null) return;
    setDeletingId(id);
    try {
      await dispatch(deleteCategoryThunk(id)).unwrap();
      dispatch(fetchBudgetThunk(month));
    } catch {
      // slice
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveGoal = async () => {
    setSavingGoal(true);
    try {
      await dispatch(updateSpendingGoalThunk(goalInput ? goalInput : null)).unwrap();
      dispatch(fetchBudgetThunk(month));
      setEditingGoal(false);
    } catch {
      // slice
    } finally {
      setSavingGoal(false);
    }
  };

  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: 0 }}>Presupuesto</h1>
        <AddExpenseButton />
      </div>

      <div style={styles.monthRow}>
        <Pressable onClick={() => dispatch(setMonth(shiftMonthKey(month, -1)))} style={styles.monthArrow}>
          <Icon name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <span style={styles.monthLabel}>{monthKeyLabel(month)}</span>
        <Pressable onClick={() => dispatch(setMonth(shiftMonthKey(month, 1)))} style={styles.monthArrow}>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchBudgetThunk(month))} /> : null}

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
        ) : monthlyGoal ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md }}>
              <div>
                <span style={{ color: colors.textPrimary, fontSize: fontSize.amountSm, fontWeight: 800 }}>
                  {formatMoney(totalSpent)}
                </span>
                <span style={{ color: colors.textMuted, fontSize: fontSize.sm, marginLeft: spacing.xs }}>
                  de {formatMoney(monthlyGoal)}
                </span>
              </div>
              <Badge
                label={`${goalPercent}%`}
                tone={goalPercent !== null && goalPercent >= 100 ? 'danger' : goalPercent !== null && goalPercent >= 80 ? 'warning' : 'success'}
              />
            </div>
            <ProgressBar percent={goalPercent ?? 0} color={goalPercent && goalPercent >= 100 ? colors.danger : colors.accent} />
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Sin meta configurada</span>
            <Pressable
              onClick={() => {
                setGoalInput('');
                setEditingGoal(true);
              }}
              style={{ background: colors.accentMuted, padding: `${spacing.xs}px ${spacing.md}px`, borderRadius: radius.pill }}
            >
              <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>Definir meta</span>
            </Pressable>
          </div>
        )}
      </div>

      {/* Dona de distribución */}
      {donutSegments.length > 0 ? (
        <div style={styles.card}>
          <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', margin: `0 0 ${spacing.md}px` }}>
            Distribución por categoría
          </p>
          <div style={styles.donutWrap}>
            <Donut segments={donutSegments} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {donutSegments.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: s.color, display: 'inline-block' }} />
                  <span style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: 600 }}>{s.category.category_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <span style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{formatMoney(s.category.spent)}</span>
                  <span style={{ color: colors.textMuted, fontSize: fontSize.xs, minWidth: 36, textAlign: 'right' }}>
                    {Math.round(s.fraction * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Categorías */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Categorías</h2>
      </div>

      {status === 'loading' && !data ? (
        <p style={{ color: colors.textMuted, textAlign: 'center' }}>Cargando presupuesto…</p>
      ) : !data || data.categories.length === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          title="Sin categorías"
          description="Crea categorías en Ajustes para ver tu desglose mensual."
        />
      ) : (
        <>
          {data.categories.map((c) => {
            const spent = Number(c.spent);
            const limit = c.monthly_limit ? Number(c.monthly_limit) : null;
            const percent = limit && limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const overBudget = limit !== null && spent > limit;
            const isEditing = editingId === c.category_id;

            return (
              <div
                key={c.category_id ?? 'uncat'}
                onClick={() => {
                  if (!isEditing) setSelectedCategory(c);
                }}
                style={dynamicStyles.categoryItem(overBudget, isEditing)}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.sm }}>
                  <IconCircle name={categoryIcons[c.category_name] ?? 'file-tray-outline'} bg={colors.surfaceAlt} color={colors.textSecondary} size={32} />
                  <div style={{ flex: 1, marginLeft: spacing.sm }}>
                    {isEditing ? (
                      <input value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus style={{ ...editInputStyle, fontSize: fontSize.md, fontWeight: 700, width: '100%' }} />
                    ) : (
                      <p style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: 700, margin: 0 }}>{c.category_name}</p>
                    )}
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginRight: 2 }}>Límite $</span>
                        <input
                          value={editingLimit}
                          onChange={(e) => setEditingLimit(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder="Sin límite"
                          style={{ ...editInputStyle, fontSize: fontSize.sm, fontWeight: 700, flex: 1, minWidth: 60 }}
                        />
                      </div>
                    ) : (
                      <>
                        <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, margin: '1px 0 0' }}>
                          {formatMoney(spent)} {limit !== null ? `de ${formatMoney(limit)}` : ''}
                        </p>
                        {c.created_at ? (
                          <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '1px 0 0' }}>
                            Creada el {formatShort(c.created_at.slice(0, 10))}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                  {!isEditing && overBudget ? (
                    <Badge label={`Sobregirado -${formatMoney(spent - (limit ?? 0))}`} tone="danger" />
                  ) : !isEditing && limit !== null && percent >= 100 ? (
                    <Badge label="Límite alcanzado" tone="warning" />
                  ) : null}
                  {!isEditing ? (
                    <div style={{ display: 'flex', gap: 2, marginLeft: spacing.xs }}>
                      <Pressable
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(c.category_id, c.category_name, c.monthly_limit);
                        }}
                        style={iconBtnStyle}
                      >
                        <Icon name="pencil-outline" size={15} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.category_id);
                        }}
                        disabled={deletingId === c.category_id}
                        style={iconBtnStyle}
                      >
                        <Icon name="trash-outline" size={15} color={colors.danger} />
                      </Pressable>
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.md }}>
                    <Pressable onClick={cancelEdit} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.surfaceAlt, color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>
                      Cancelar
                    </Pressable>
                    <Pressable onClick={saveEdit} disabled={savingEdit} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.accent, color: colors.black, fontWeight: 700, fontSize: fontSize.sm }}>
                      {savingEdit ? 'Guardando…' : 'Guardar'}
                    </Pressable>
                  </div>
                ) : (
                  <>
                    {limit !== null ? <ProgressBar percent={percent} color={overBudget ? colors.danger : colors.accent} /> : null}
                    {Number(c.credit_pending) > 0 ? (
                      <p style={{ color: colors.warning, fontSize: fontSize.xs, marginTop: spacing.sm }}>{formatMoney(c.credit_pending)} pendiente de salir (tarjeta)</p>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </>
      )}

      <CategoryTransactionsSheet category={selectedCategory} month={month} onClose={() => setSelectedCategory(null)} />
    </PageShell>
  );
}
