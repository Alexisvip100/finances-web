import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, DangerButton } from '../../../components/Buttons';
import { AmountInput } from '../../../components/AmountInput';
import { PaymentDayField } from '../../../components/PaymentDayField';
import { ErrorBanner } from '../../../components/Misc';
import { spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createIncomeThunk, deleteIncomeThunk, updateIncomeThunk } from '../../../store/slices/incomesSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { PaymentDay } from '../../../types';
import { accountLabel } from '../../../utils/labels';
import { decodePaymentDayToState, PaymentDayState, resolvePaymentDayValue } from '../../../utils/paymentDay';
import { dynamicStyles, styles } from './IncomeFormPage.styles';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={dynamicStyles.toggleBtn(value)}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: '#FFFFFF',
          display: 'block',
        }}
      />
    </button>
  );
}

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
