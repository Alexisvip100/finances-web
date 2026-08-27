import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PageShell } from '../../components/PageShell';
import { ProgressBar } from '../../components/cards/ProgressBar';
import { Badge, EmptyState, ErrorBanner, IconCircle } from '../../components/Misc';
import { Icon } from '../../components/Icon';
import { AddExpenseButton } from '../../components/AddExpenseButton';
import { Pressable } from '../../components/Pressable';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBudgetThunk, setMonth } from '../../store/slices/budgetSlice';
import { deleteCategoryThunk, updateCategoryThunk } from '../../store/slices/categoriesSlice';
import { updateSpendingGoalThunk } from '../../store/slices/authSlice';
import { formatMoney } from '../../utils/currency';
import { formatShort, monthKeyLabel, shiftMonthKey } from '../../utils/dateHelpers';
import { CategoryTransactionsSheet } from './CategoryTransactionsSheet';
import type { CategoryBudget } from '../../types';

// Pasteles, pero separados por hue (no tonos vecinos) para que categorías
// distintas no se confundan entre sí en la dona/leyenda.
const DONUT_COLORS = ['#A8E0A0', '#8FC6E8', '#F2A6C6', '#C6A8E8', '#F2C48F', '#8FE0D1'];
const DONUT_SIZE = 220;
const DONUT_STROKE = 20;

const DONUT_EASE = [0.32, 0.72, 0, 1] as const;

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

// Alternativa a la dona: comparar montos exactos entre categorías es más
// fácil con barras que con proporciones de un círculo.
function CategoryBarChart({ segments }: { segments: { category: CategoryBudget; color: string }[] }) {
  const sorted = [...segments].sort((a, b) => Number(b.category.spent) - Number(a.category.spent));
  const max = sorted.length > 0 ? Number(sorted[0].category.spent) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, width: '100%' }}>
      {sorted.map((s) => {
        const spent = Number(s.category.spent);
        const widthPercent = max > 0 ? Math.max(4, (spent / max) * 100) : 0;
        return (
          <div key={s.category.category_id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: 700 }}>{s.category.category_name}</span>
              <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 700 }}>{formatMoney(spent)}</span>
            </div>
            <div style={{ background: colors.surfaceAlt, borderRadius: radius.pill, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${widthPercent}%`, height: '100%', background: s.color, borderRadius: radius.pill }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CHART_VIEWS: { value: 'donut' | 'bar'; label: string; icon: string }[] = [
  { value: 'donut', label: 'Circular', icon: 'pie-chart-outline' },
  { value: 'bar', label: 'Lineal', icon: 'bar-chart-outline' },
];

const editInputStyle: React.CSSProperties = { color: colors.textPrimary, background: 'none', border: 'none', padding: 0 };
const iconBtnStyle: React.CSSProperties = { padding: spacing.sm };

export default function BudgetPage() {
  const dispatch = useAppDispatch();
  const { data, month, error } = useAppSelector((s) => s.budget);
  const categoriesError = useAppSelector((s) => s.categories.error);
  const authError = useAppSelector((s) => s.auth.error);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLimit, setEditingLimit] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const [chartView, setChartView] = useState<'donut' | 'bar'>('donut');

  useEffect(() => {
    dispatch(fetchBudgetThunk(month));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const changeMonth = (delta: number) => {
    const next = shiftMonthKey(month, delta);
    dispatch(setMonth(next));
    dispatch(fetchBudgetThunk(next));
  };

  const startEdit = (categoryId: number, name: string, limit: string | null) => {
    setEditingId(categoryId);
    setEditingName(name);
    setEditingLimit(limit ?? '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (editingId === null || !editingName.trim()) return;
    setSavingEdit(true);
    try {
      await dispatch(updateCategoryThunk({ id: editingId, payload: { name: editingName.trim(), monthly_limit: editingLimit || undefined } })).unwrap();
      setEditingId(null);
      dispatch(fetchBudgetThunk(month));
    } catch {
      // el error ya se muestra desde categoriesError arriba
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    setDeletingId(categoryId);
    try {
      await dispatch(deleteCategoryThunk(categoryId)).unwrap();
      dispatch(fetchBudgetThunk(month));
    } catch {
      // el error ya se muestra desde categoriesError arriba (ej. 409 si tiene gastos)
    } finally {
      setDeletingId(null);
    }
  };

  const startEditGoal = () => {
    setGoalInput(data?.spending_goal ?? '');
    setEditingGoal(true);
  };

  const saveGoal = async () => {
    setSavingGoal(true);
    try {
      await dispatch(updateSpendingGoalThunk(goalInput || null)).unwrap();
      setEditingGoal(false);
      dispatch(fetchBudgetThunk(month));
    } catch {
      // el error ya se muestra desde authError abajo
    } finally {
      setSavingGoal(false);
    }
  };

  const totalSpent = data ? Number(data.total_spent) : 0;
  const segments = useMemo(() => {
    if (!data || totalSpent === 0) return [];
    return data.categories
      .filter((c) => Number(c.spent) > 0)
      .map((c, idx) => ({ category: c, color: DONUT_COLORS[idx % DONUT_COLORS.length], fraction: Number(c.spent) / totalSpent }));
  }, [data, totalSpent]);

  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: 0 }}>Presupuesto</h1>
        <AddExpenseButton />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.xl }}>
        <Pressable onClick={() => changeMonth(-1)} style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700 }}>{monthKeyLabel(month)}</span>
        <Pressable onClick={() => changeMonth(1)} style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchBudgetThunk(month))} /> : null}
      {categoriesError ? <ErrorBanner message={categoriesError} /> : null}
      {authError ? <ErrorBanner message={authError} /> : null}

      {data ? (
        <div style={{ background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.xl }}>
          {editingGoal ? (
            <>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.6, margin: 0 }}>META DE GASTO MENSUAL</p>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 12px' }}>Cuánto quieres gastar como máximo al mes, para poder ahorrar el resto.</p>
              <div style={{ display: 'flex', alignItems: 'center', background: colors.surfaceAlt, borderRadius: radius.input, padding: `${spacing.md}px ${spacing.lg}px` }}>
                <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, marginRight: 4 }}>$</span>
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="Ej. 8000"
                  autoFocus
                  style={{ ...editInputStyle, flex: 1, fontSize: fontSize.md, fontWeight: 700 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.md }}>
                <Pressable onClick={() => setEditingGoal(false)} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.surfaceAlt, color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>
                  Cancelar
                </Pressable>
                <Pressable onClick={saveGoal} disabled={savingGoal} style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.accent, color: colors.black, fontWeight: 700, fontSize: fontSize.sm }}>
                  {savingGoal ? 'Guardando…' : 'Guardar'}
                </Pressable>
              </div>
            </>
          ) : data.spending_goal === null ? (
            <Pressable onClick={startEditGoal} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Icon name="flag-outline" size={18} color={colors.accent} style={{ marginRight: spacing.md, flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>Configura tu meta de ahorro</p>
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>Define cuánto quieres gastar como máximo al mes.</p>
              </div>
              <Icon name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.6 }}>META DE GASTO MENSUAL</span>
                <Pressable onClick={startEditGoal} style={iconBtnStyle}>
                  <Icon name="pencil-outline" size={14} color={colors.textSecondary} />
                </Pressable>
              </div>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, marginBottom: spacing.md }}>
                {formatMoney(totalSpent)} <span style={{ color: colors.textMuted, fontSize: fontSize.sm, fontWeight: 600 }}>de {formatMoney(data.spending_goal)}</span>
              </p>
              <ProgressBar percent={Math.round((totalSpent / Number(data.spending_goal)) * 100)} color={totalSpent > Number(data.spending_goal) ? colors.danger : colors.accent} />
              {Number(data.income_this_month) > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg }}>
                  <span style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Ahorro proyectado este mes</span>
                  <span style={{ color: Number(data.projected_savings) < 0 ? colors.danger : colors.accent, fontSize: fontSize.md, fontWeight: 800 }}>
                    {formatMoney(data.projected_savings)}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {!data || data.categories.length === 0 ? (
        <EmptyState icon="pie-chart-outline" title="Sin gastos este mes" description="Cuando registres gastos, aquí verás el desglose por categoría." />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', background: colors.surface, borderRadius: radius.pill, padding: 4, margin: `0 auto ${spacing.lg}px`, width: 'fit-content' }}>
            {CHART_VIEWS.map((v) => {
              const active = chartView === v.value;
              return (
                <Pressable
                  key={v.value}
                  onClick={() => setChartView(v.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: `${spacing.sm}px ${spacing.lg}px`,
                    borderRadius: radius.pill,
                    background: active ? colors.accent : 'transparent',
                    color: active ? colors.black : colors.textSecondary,
                    fontWeight: 700,
                    fontSize: fontSize.sm,
                  }}
                >
                  <Icon name={v.icon} size={14} color={active ? colors.black : colors.textSecondary} />
                  {v.label}
                </Pressable>
              );
            })}
          </div>

          {chartView === 'donut' ? (
            <motion.div
              key={`donut-${month}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: DONUT_EASE }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: spacing.xl }}
            >
              <Donut segments={segments} />
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', width: DONUT_SIZE - DONUT_STROKE * 2 - 24 }}>
                <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.5 }}>TOTAL GASTADO</span>
                <span style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, marginTop: 4, textAlign: 'center' }}>
                  {formatMoney(totalSpent)}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`bar-${month}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: DONUT_EASE }}
              style={{ marginBottom: spacing.xl }}
            >
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.5, marginBottom: spacing.lg }}>
                TOTAL GASTADO · {formatMoney(totalSpent)}
              </p>
              <CategoryBarChart segments={segments} />
            </motion.div>
          )}

          {chartView === 'donut' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.xxl }}>
              {segments.map((s) => (
                <div key={s.category.category_id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color, display: 'inline-block' }} />
                  <span style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{s.category.category_name}</span>
                </div>
              ))}
            </div>
          ) : null}

          <h2 style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, marginBottom: spacing.lg }}>Desglose por categoría</h2>
          {data.categories.map((c) => {
            const spent = Number(c.spent);
            const limit = c.monthly_limit ? Number(c.monthly_limit) : null;
            const percent = limit ? Math.round((spent / limit) * 100) : 0;
            const overBudget = limit !== null && spent > limit;
            const isEditing = editingId === c.category_id;

            return (
              <div
                key={c.category_id}
                onClick={() => {
                  if (!isEditing) setSelectedCategory(c);
                }}
                style={{
                  background: colors.surface,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  border: overBudget ? `1px solid ${colors.danger}` : 'none',
                  cursor: isEditing ? 'default' : 'pointer',
                }}
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
