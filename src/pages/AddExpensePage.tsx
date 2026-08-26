import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { Pressable } from '../components/Pressable';
import { Icon } from '../components/Icon';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { AmountInput } from '../components/AmountInput';
import { ErrorBanner } from '../components/Misc';
import { TextField } from '../components/TextField';
import { colors, categoryIcons, fontSize, radius, spacing } from '../theme/theme';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAccountsThunk } from '../store/slices/accountsSlice';
import { fetchCardsThunk } from '../store/slices/cardsSlice';
import { fetchCategoriesThunk, createCategoryThunk } from '../store/slices/categoriesSlice';
import { createTransactionThunk } from '../store/slices/transactionsSlice';
import { previewCycleBounds } from '../utils/cycleHelpers';
import { formatShort, maskDateInput, parseISODate, todayISO, toISODate } from '../utils/dateHelpers';
import { accountLabel, cardLabel } from '../utils/labels';

type MethodSelection = { kind: 'account'; id: number } | { kind: 'card'; id: number } | null;

const sectionLabelStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: fontSize.sm,
  fontWeight: 700,
  marginTop: spacing.xl,
  marginBottom: spacing.md,
};

const modalRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  borderBottom: `1px solid ${colors.divider}`,
  width: '100%',
};

export default function AddExpensePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);
  const categories = useAppSelector((s) => s.categories.items);
  const error = useAppSelector((s) => s.transactions.error);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<MethodSelection>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isMsi, setIsMsi] = useState(false);
  const [months, setMonths] = useState('3');
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [customDate, setCustomDate] = useState(todayISO());

  useEffect(() => {
    dispatch(fetchAccountsThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!method && accounts.length > 0) setMethod({ kind: 'account', id: accounts[0].id });
  }, [accounts, method]);

  const selectedCard = method?.kind === 'card' ? cards.find((c) => c.id === method.id) : undefined;
  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

  const preview = useMemo(() => {
    if (!selectedCard || customDate.length !== 10) return null;
    return previewCycleBounds(selectedCard.statement_day, selectedCard.payment_term_days, parseISODate(customDate));
  }, [selectedCard, customDate]);

  const canSave = Number(amount) > 0 && method !== null && description.trim().length > 0 && customDate.length === 10;

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const created = await dispatch(createCategoryThunk({ name: newCategoryName.trim() })).unwrap();
    setCategoryId(created.id);
    setNewCategoryName('');
  };

  const handleSave = async () => {
    if (!canSave || !method) return;
    setSaving(true);
    try {
      await dispatch(
        createTransactionThunk({
          amount,
          category_id: categoryId ?? undefined,
          description: description.trim(),
          transaction_date: customDate,
          payment_method: method.kind === 'card' ? 'CREDIT' : 'DEBIT',
          account_id: method.kind === 'account' ? method.id : undefined,
          credit_card_id: method.kind === 'card' ? method.id : undefined,
          installment_months: method.kind === 'card' && isMsi ? Number(months) : undefined,
        })
      ).unwrap();
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell contentStyle={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: colors.divider, margin: `0 auto ${spacing.lg}px` }} />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <Pressable
          onClick={() => navigate(-1)}
          style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={18} color={colors.textPrimary} />
        </Pressable>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800 }}>Registrar gasto</span>
        <div style={{ width: 32, height: 32 }} />
      </div>

      {editingDate ? (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
          <input
            value={customDate}
            onChange={(e) => setCustomDate(maskDateInput(e.target.value))}
            placeholder="2026-09-15"
            inputMode="numeric"
            maxLength={10}
            autoFocus
            style={{
              background: colors.surface,
              borderRadius: radius.pill,
              padding: `${spacing.sm}px ${spacing.lg}px`,
              color: colors.textPrimary,
              fontSize: fontSize.sm,
              fontWeight: 600,
              minWidth: 120,
              textAlign: 'center',
            }}
          />
          <Pressable
            onClick={() => {
              setCustomDate(todayISO());
              setEditingDate(false);
            }}
            style={{ background: colors.surfaceAlt, borderRadius: radius.pill, padding: `${spacing.sm}px ${spacing.md}px` }}
          >
            <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 700 }}>Hoy</span>
          </Pressable>
          <Pressable
            onClick={() => setEditingDate(false)}
            disabled={customDate.length !== 10}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: customDate.length !== 10 ? 0.4 : 1,
            }}
          >
            <Icon name="checkmark" size={16} color={colors.black} />
          </Pressable>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spacing.xl }}>
          <Pressable
            onClick={() => setEditingDate(true)}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', background: colors.surface, borderRadius: radius.pill, padding: `${spacing.sm}px ${spacing.lg}px` }}
          >
            <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>
              {customDate === todayISO() ? 'Hoy' : formatShort(customDate)}
            </span>
            <Icon name="pencil" size={12} color={colors.textSecondary} style={{ marginLeft: spacing.sm }} />
          </Pressable>
        </div>
      )}

      <AmountInput value={amount} onChangeText={setAmount} size="amountLg" autoFocus />

      {error ? <ErrorBanner message={error} /> : null}

      <p style={sectionLabelStyle}>¿Qué compraste?</p>
      <TextField value={description} onChangeText={setDescription} placeholder="Ej. Café, gasolina, súper" style={{ marginBottom: 0 }} />

      <p style={sectionLabelStyle}>Cuenta o tarjeta</p>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {accounts.map((a) => {
          const active = method?.kind === 'account' && method.id === a.id;
          return (
            <Pressable
              key={`account-${a.id}`}
              onClick={() => setMethod({ kind: 'account', id: a.id })}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: spacing.md,
                paddingRight: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.md,
                borderRadius: radius.pill,
                background: active ? colors.accentMuted : colors.surface,
                border: active ? `1px solid ${colors.accent}` : 'none',
              }}
            >
              <Icon name={a.type === 'CASH' ? 'cash-outline' : 'business-outline'} size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>{accountLabel(a)}</span>
            </Pressable>
          );
        })}
        {cards.map((c) => {
          const active = method?.kind === 'card' && method.id === c.id;
          return (
            <Pressable
              key={`card-${c.id}`}
              onClick={() => setMethod({ kind: 'card', id: c.id })}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: spacing.md,
                paddingRight: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.md,
                borderRadius: radius.pill,
                background: active ? colors.accentMuted : colors.surface,
                border: active ? `1px solid ${colors.accent}` : 'none',
              }}
            >
              <Icon name="card-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>{cardLabel(c)}</span>
            </Pressable>
          );
        })}
      </div>

      {preview ? (
        <div style={{ display: 'flex', flexDirection: 'row', background: colors.warningMuted, borderRadius: radius.input, padding: spacing.md, marginTop: spacing.lg }}>
          <Icon name="information-circle-outline" size={16} color={colors.warning} style={{ marginRight: spacing.sm }} />
          <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>
            Se paga el {formatShort(toISODate(preview.due))} · ciclo {formatShort(toISODate(preview.start))} – {formatShort(toISODate(preview.end))}
          </span>
        </div>
      ) : null}

      <p style={sectionLabelStyle}>Categoría (opcional)</p>
      <Pressable
        onClick={() => setCategoryPickerOpen(true)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          background: colors.surface,
          borderRadius: radius.input,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
        }}
      >
        <Icon
          name={categoryIcons[selectedCategory?.name ?? ''] ?? 'pricetag-outline'}
          size={16}
          color={colors.textSecondary}
          style={{ marginRight: spacing.sm }}
        />
        <span style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, textAlign: 'left' }}>
          {selectedCategory ? selectedCategory.name : 'Sin categoría'}
        </span>
        <Icon name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {categoryPickerOpen ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setCategoryPickerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div
            style={{
              position: 'relative',
              background: colors.surfaceAlt,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              padding: spacing.lg,
              paddingBottom: spacing.xxl,
            }}
          >
            <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, marginBottom: spacing.md }}>Categoría</p>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              <Pressable
                onClick={() => {
                  setCategoryId(null);
                  setCategoryPickerOpen(false);
                }}
                style={modalRowStyle}
              >
                <Icon name="close-circle-outline" size={18} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
                <span style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, textAlign: 'left' }}>Sin categoría</span>
                {categoryId === null ? <Icon name="checkmark" size={18} color={colors.accent} /> : null}
              </Pressable>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  onClick={() => {
                    setCategoryId(c.id);
                    setCategoryPickerOpen(false);
                  }}
                  style={modalRowStyle}
                >
                  <Icon name={categoryIcons[c.name] ?? 'pricetag-outline'} size={18} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
                  <span style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, textAlign: 'left' }}>{c.name}</span>
                  {categoryId === c.id ? <Icon name="checkmark" size={18} color={colors.accent} /> : null}
                </Pressable>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm }}>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                }}
                style={{ flex: 1, background: colors.surface, borderRadius: radius.input, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.sm }}
              />
              <Pressable
                onClick={handleAddCategory}
                style={{ width: 40, height: 40, borderRadius: radius.input, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="add" size={18} color={colors.accent} />
              </Pressable>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCard ? (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, gap: spacing.md }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>Meses sin intereses</p>
            <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>Diferir este pago</p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 26, flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={isMsi}
              onChange={(e) => setIsMsi(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background: isMsi ? colors.accent : colors.divider,
                borderRadius: radius.pill,
                transition: 'background 0.15s',
                cursor: 'pointer',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: isMsi ? 21 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: colors.white,
                transition: 'left 0.15s',
                pointerEvents: 'none',
              }}
            />
          </label>
        </div>
      ) : null}
      {selectedCard && isMsi ? (
        <input
          value={months}
          onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))}
          placeholder="Meses"
          inputMode="numeric"
          style={{ background: colors.surface, borderRadius: radius.input, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, marginTop: spacing.md, width: '100%' }}
        />
      ) : null}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md, paddingTop: spacing.lg }}>
        <SecondaryButton label="Cancelar" onPress={() => navigate(-1)} style={{ flex: 1 }} />
        <PrimaryButton label="Guardar gasto" onPress={handleSave} disabled={!canSave} loading={saving} style={{ flex: 1 }} />
      </div>
    </PageShell>
  );
}
