import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { TopBar } from '../../components/TopBar';
import { PrimaryButton, DangerButton } from '../../components/Buttons';
import { AmountInput } from '../../components/AmountInput';
import { PaymentDayField } from '../../components/PaymentDayField';
import { ErrorBanner } from '../../components/Misc';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { createIncomeThunk, deleteIncomeThunk, updateIncomeThunk } from '../../store/slices/incomesSlice';
import { fetchAccountsThunk } from '../../store/slices/accountsSlice';
import { PaymentDay } from '../../types';
import { accountLabel } from '../../utils/labels';
import { decodePaymentDayToState, PaymentDayState, resolvePaymentDayValue } from '../../utils/paymentDay';

export default function IncomeFormPage() {
  const navigate = useNavigate();
  const { incomeId } = useParams();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const error = useAppSelector((s) => s.incomes.error);
  const existing = useAppSelector((s) => s.incomes.items.find((i) => i.id === Number(incomeId)));
  const isEditing = existing !== undefined;

  const [amount, setAmount] = useState(existing?.amount ?? '');
  const [firstDayState, setFirstDayState] = useState<PaymentDayState>(decodePaymentDayToState(existing?.payment_days[0]));
  const [hasSecondPayment, setHasSecondPayment] = useState((existing?.payment_days.length ?? 0) > 1);
  const [secondDayState, setSecondDayState] = useState<PaymentDayState>(
    existing?.payment_days[1] !== undefined
      ? decodePaymentDayToState(existing.payment_days[1])
      : { mode: 'day', dayText: '', isLastDay: true, adjustWeekend: false }
  );
  const [accountId, setAccountId] = useState<number | null>(existing?.account_id ?? accounts[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const name = existing?.name ?? 'Ingreso';

  useEffect(() => {
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (accountId === null && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  const firstDayValue = resolvePaymentDayValue(firstDayState);
  const secondDayValue = resolvePaymentDayValue(secondDayState);
  const firstDayValid = firstDayValue !== null;
  const secondDayValid = !hasSecondPayment || secondDayValue !== null;

  const paymentDays: PaymentDay[] =
    firstDayValue !== null ? (hasSecondPayment && secondDayValue !== null ? [firstDayValue, secondDayValue] : [firstDayValue]) : [];
  // La frecuencia ya no la elige el usuario — es solo la etiqueta que
  // describe cuántos días de pago capturó (el cálculo real de fechas usa
  // payment_days directamente, ver income_schedule.py).
  const frequency = hasSecondPayment ? 'BIWEEKLY' : 'MONTHLY';

  const canSave = Number(amount) > 0 && accountId !== null && firstDayValid && secondDayValid;

  const handleSave = async () => {
    if (!canSave || !accountId) return;
    setSaving(true);
    try {
      if (isEditing) {
        await dispatch(
          updateIncomeThunk({ id: existing.id, payload: { name, amount, frequency, payment_days: paymentDays } })
        ).unwrap();
      } else {
        await dispatch(createIncomeThunk({ name, amount, frequency, payment_days: paymentDays, account_id: accountId })).unwrap();
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
      await dispatch(deleteIncomeThunk(existing.id)).unwrap();
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell>
      <TopBar title={isEditing ? 'Editar ingreso' : 'Agregar ingreso'} onBack={() => navigate(-1)} />
      {error ? <ErrorBanner message={error} /> : null}

      <div style={styles.amountCard}>
        <AmountInput value={amount} onChangeText={setAmount} size="amountMd" />
      </div>

      <PaymentDayField label="Día de pago" state={firstDayState} onChange={setFirstDayState} />

      <div style={styles.switchRow}>
        <div style={{ flex: 1 }}>
          <p style={styles.switchLabel}>Tengo un segundo pago al mes</p>
          <p style={styles.hint}>Por ejemplo, si te pagan quincenal</p>
        </div>
        <Toggle value={hasSecondPayment} onChange={setHasSecondPayment} />
      </div>

      {hasSecondPayment ? (
        <PaymentDayField label="Día del segundo pago" state={secondDayState} onChange={setSecondDayState} />
      ) : null}

      <p style={styles.label}>Cuenta destino</p>
      <div style={styles.chipsRow}>
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            style={{
              ...styles.chip,
              ...(accountId === a.id ? styles.chipActive : {}),
              ...(isEditing ? styles.chipDisabled : {}),
            }}
            onClick={() => !isEditing && setAccountId(a.id)}
            disabled={isEditing}
          >
            <span style={{ ...styles.chipLabel, ...(accountId === a.id ? styles.chipLabelActive : {}) }}>{accountLabel(a)}</span>
          </button>
        ))}
      </div>
      {isEditing ? <p style={styles.hint}>La cuenta destino no se puede cambiar después de crear el ingreso</p> : null}

      <PrimaryButton
        label={isEditing ? 'Guardar cambios' : 'Guardar ingreso'}
        onPress={handleSave}
        disabled={!canSave}
        loading={saving}
        style={{ marginTop: spacing.xl }}
      />
      {isEditing ? (
        <DangerButton label="Eliminar ingreso" onPress={handleDelete} loading={deleting} style={{ marginTop: spacing.md }} />
      ) : null}
    </PageShell>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: value ? colors.accent : colors.divider,
        border: 'none',
        padding: 2,
        display: 'flex',
        justifyContent: value ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s ease',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: colors.white,
          display: 'block',
        }}
      />
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  amountCard: { background: colors.surface, borderRadius: radius.card, paddingTop: spacing.xl, paddingBottom: spacing.xl, marginBottom: spacing.xl },
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, marginBottom: spacing.sm, marginTop: spacing.lg },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.sm },
  switchRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  switchLabel: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 },
  chipsRow: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: radius.pill,
    background: colors.surface,
    border: 'none',
    cursor: 'pointer',
  },
  chipActive: { background: colors.accentMuted, border: `1px solid ${colors.accent}` },
  chipDisabled: { opacity: 0.6 },
  chipLabel: { color: colors.textSecondary, fontWeight: 600, fontSize: fontSize.sm },
  chipLabelActive: { color: colors.accent },
};
