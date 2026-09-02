import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, DangerButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createFixedExpenseThunk, deleteFixedExpenseThunk, updateFixedExpenseThunk } from '../../../store/slices/fixedExpensesSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { styles } from './FixedExpenseFormPage.styles';

type SourceSelection = { kind: 'account'; id: number } | { kind: 'card'; id: number } | null;

export default function FixedExpenseFormPage() {
  const navigate = useNavigate();
  const { fixedExpenseId } = useParams();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);
  const categories = useAppSelector((s) => s.categories.items);
  const error = useAppSelector((s) => s.fixedExpenses.error);
  const existing = useAppSelector((s) => s.fixedExpenses.items.find((f) => f.id === Number(fixedExpenseId)));
  const isEditing = existing !== undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? '');
  const [dayOfMonth, setDayOfMonth] = useState(existing ? String(existing.day_of_month) : '1');
  const [categoryId, setCategoryId] = useState<number | null>(existing?.category_id ?? null);
  const [source, setSource] = useState<SourceSelection>(
    existing
      ? existing.account_id
        ? { kind: 'account', id: existing.account_id }
        : { kind: 'card', id: existing.credit_card_id! }
      : null
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(categories[0].id);
  }, [categories, categoryId]);
  useEffect(() => {
    if (!source && accounts.length > 0) setSource({ kind: 'account', id: accounts[0].id });
  }, [accounts, source]);

  const canSave = Boolean(name.trim() && Number(amount) > 0 && Number(dayOfMonth) >= 1 && Number(dayOfMonth) <= 31 && categoryId && source);

  const handleSave = async () => {
    if (!canSave || !source || !categoryId) return;
    setSaving(true);
    try {
      if (isEditing) {
        await dispatch(
          updateFixedExpenseThunk({
            id: existing.id,
            payload: { name: name.trim(), amount, day_of_month: Number(dayOfMonth), category_id: categoryId },
          })
        ).unwrap();
      } else {
        await dispatch(
          createFixedExpenseThunk({
            name: name.trim(),
            amount,
            day_of_month: Number(dayOfMonth),
            category_id: categoryId,
            account_id: source.kind === 'account' ? source.id : undefined,
            credit_card_id: source.kind === 'card' ? source.id : undefined,
          })
        ).unwrap();
      }
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setDeleting(true);
    try {
      await dispatch(deleteFixedExpenseThunk(existing.id)).unwrap();
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell>
      <TopBar title={isEditing ? 'Editar gasto fijo' : 'Agregar gasto fijo'} onBack={() => navigate(-1)} />
      {error ? <ErrorBanner message={error} /> : null}

      <p style={styles.label}>Nombre</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej. Renta, Spotify"
        style={styles.input}
      />

      <div style={styles.twoCol}>
        <div style={{ flex: 1 }}>
          <p style={styles.label}>Monto</p>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            inputMode="decimal"
            style={styles.input}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.label}>Día del mes</p>
          <input
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value.replace(/\D/g, ''))}
            placeholder="1"
            inputMode="numeric"
            style={styles.input}
          />
        </div>
      </div>

      <p style={styles.label}>Categoría</p>
      <div style={styles.chipsRow}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            style={{ ...styles.chip, ...(categoryId === c.id ? styles.chipActive : {}) }}
            onClick={() => setCategoryId(c.id)}
          >
            <span style={{ ...styles.chipLabel, ...(categoryId === c.id ? styles.chipLabelActive : {}) }}>{c.name}</span>
          </button>
        ))}
      </div>

      <p style={styles.label}>Se paga con</p>
      <div style={styles.chipsRow}>
        {accounts.map((a) => (
          <button
            key={`a-${a.id}`}
            type="button"
            style={{
              ...styles.chip,
              ...(source?.kind === 'account' && source.id === a.id ? styles.chipActive : {}),
              ...(isEditing ? styles.chipDisabled : {}),
            }}
            onClick={() => !isEditing && setSource({ kind: 'account', id: a.id })}
            disabled={isEditing}
          >
            <span style={{ ...styles.chipLabel, ...(source?.kind === 'account' && source.id === a.id ? styles.chipLabelActive : {}) }}>
              {accountLabel(a)}
            </span>
          </button>
        ))}
        {cards.map((c) => (
          <button
            key={`c-${c.id}`}
            type="button"
            style={{
              ...styles.chip,
              ...(source?.kind === 'card' && source.id === c.id ? styles.chipActive : {}),
              ...(isEditing ? styles.chipDisabled : {}),
            }}
            onClick={() => !isEditing && setSource({ kind: 'card', id: c.id })}
            disabled={isEditing}
          >
            <span style={{ ...styles.chipLabel, ...(source?.kind === 'card' && source.id === c.id ? styles.chipLabelActive : {}) }}>
              {cardLabel(c)}
            </span>
          </button>
        ))}
      </div>
      {isEditing ? <p style={styles.hint}>El método de pago no se puede cambiar después de crear el gasto fijo</p> : null}

      <PrimaryButton
        label={isEditing ? 'Guardar cambios' : 'Guardar gasto fijo'}
        onPress={handleSave}
        disabled={!canSave}
        loading={saving}
        style={{ marginTop: spacing.xl }}
      />
      {isEditing ? (
        <DangerButton label="Eliminar gasto fijo" onPress={handleDelete} loading={deleting} style={{ marginTop: spacing.md }} />
      ) : null}
    </PageShell>
  );
}
