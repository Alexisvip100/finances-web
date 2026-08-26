import React, { useEffect, useMemo, useState } from 'react';
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
import { monthKeyLabel, shiftMonthKey } from '../../utils/dateHelpers';

const DONUT_COLORS = [colors.accent, '#8B8F9A', '#F2565B', '#4E8DF2', '#F2B84E', '#B24EF2'];
const DONUT_SIZE = 220;
const DONUT_STROKE = 20;

// Anima de 0 -> target cada vez que target cambia (entrar a la tab, cambiar
// de mes, etc.) — usado tanto para el número "TOTAL GASTADO" como para que
// los arcos de la dona crezcan en sincronía con el conteo.
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function Donut({ segments, progress = 1 }: { segments: { color: string; fraction: number }[]; progress?: number }) {
  const size = DONUT_SIZE;
  const strokeWidth = DONUT_STROKE;
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  let cumulative = 0;

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={radiusPx} stroke={colors.surfaceAlt} strokeWidth={strokeWidth} fill="none" />
      {segments.map((s, idx) => {
        const fraction = s.fraction * progress;
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
  const animatedTotalSpent = useCountUp(totalSpent);
  const donutProgress = totalSpent > 0 ? Math.min(1, animatedTotalSpent / totalSpent) : 1;
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: spacing.xl }}>
            <Donut segments={segments} progress={donutProgress} />
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', width: DONUT_SIZE - DONUT_STROKE * 2 - 24 }}>
              <span style={{ color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 700, letterSpacing: 0.5 }}>TOTAL GASTADO</span>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: 800, marginTop: 4, textAlign: 'center' }}>
                {formatMoney(animatedTotalSpent)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.xxl }}>
            {segments.map((s) => (
              <div key={s.category.category_id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color, display: 'inline-block' }} />
                <span style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{s.category.category_name}</span>
              </div>
            ))}
          </div>

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
                style={{
                  background: colors.surface,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  border: overBudget ? `1px solid ${colors.danger}` : 'none',
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
                      <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, margin: '1px 0 0' }}>
                        {formatMoney(spent)} {limit !== null ? `de ${formatMoney(limit)}` : ''}
                      </p>
                    )}
                  </div>
                  {!isEditing && overBudget ? (
                    <Badge label={`Sobregirado -${formatMoney(spent - (limit ?? 0))}`} tone="danger" />
                  ) : !isEditing && limit !== null && percent >= 100 ? (
                    <Badge label="Límite alcanzado" tone="warning" />
                  ) : null}
                  {!isEditing ? (
                    <div style={{ display: 'flex', gap: 2, marginLeft: spacing.xs }}>
                      <Pressable onClick={() => startEdit(c.category_id, c.category_name, c.monthly_limit)} style={iconBtnStyle}>
                        <Icon name="pencil-outline" size={15} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable onClick={() => handleDelete(c.category_id)} disabled={deletingId === c.category_id} style={iconBtnStyle}>
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
    </PageShell>
  );
}
