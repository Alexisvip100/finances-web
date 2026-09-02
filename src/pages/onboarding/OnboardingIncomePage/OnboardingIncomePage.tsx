import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { AmountInput } from '../../../components/AmountInput';
import { PaymentDayField } from '../../../components/PaymentDayField';
import { ErrorBanner } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createIncomeThunk } from '../../../store/slices/incomesSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { PaymentDay } from '../../../types';
import { PaymentDayState, resolvePaymentDayValue } from '../../../utils/paymentDay';
import { dynamicStyles, styles } from './OnboardingIncomePage.styles';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={dynamicStyles.toggleBtn(value)}
    >
      <span style={dynamicStyles.toggleThumb} />
    </button>
  );
}

export default function OnboardingIncomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const error = useAppSelector((s) => s.incomes.error);
  const [amount, setAmount] = useState('');
  const [firstDayState, setFirstDayState] = useState<PaymentDayState>({ mode: 'day', dayText: '15', isLastDay: false, adjustWeekend: false });
  const [hasSecondPayment, setHasSecondPayment] = useState(true);
  const [secondDayState, setSecondDayState] = useState<PaymentDayState>({ mode: 'day', dayText: '', isLastDay: true, adjustWeekend: false });
  const [saving, setSaving] = useState(false);

  const firstDayValue = resolvePaymentDayValue(firstDayState);
  const secondDayValue = resolvePaymentDayValue(secondDayState);
  const firstDayValid = firstDayValue !== null;
  const secondDayValid = !hasSecondPayment || secondDayValue !== null;

  const paymentDays: PaymentDay[] =
    firstDayValue !== null ? (hasSecondPayment && secondDayValue !== null ? [firstDayValue, secondDayValue] : [firstDayValue]) : [];
  const frequency = hasSecondPayment ? 'BIWEEKLY' : 'MONTHLY';

  const canFinish = Number(amount) > 0 && accounts.length > 0 && firstDayValid && secondDayValid;

  const finish = async () => {
    setSaving(true);
    try {
      if (canFinish) {
        await dispatch(
          createIncomeThunk({
            name: 'Ingreso principal',
            amount,
            frequency,
            payment_days: paymentDays,
            account_id: accounts[0].id,
          })
        ).unwrap();
      }
      await dispatch(fetchAccountsThunk()).unwrap();
      navigate('/');
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell contentStyle={styles.content}>
      <div style={{ flex: 1 }}>
        <div style={styles.progressRow}>
          <Pressable onClick={() => navigate(-1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-back" size={18} color={colors.accent} />
          </Pressable>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
          <TextLinkButton label="Saltar" onPress={() => navigate('/')} style={styles.skipBtn} />
        </div>

        <h1 style={styles.title}>
          ¿Cuándo te pagan?
        </h1>
        <p style={styles.subtitle}>
          Conocer tu ritmo de ingresos nos ayuda a predecir tu flujo de caja.
        </p>

        {error ? <ErrorBanner message={error} /> : null}

        {accounts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', background: colors.warningMuted, borderRadius: radius.input, padding: spacing.md, marginBottom: spacing.lg }}>
            <Icon name="alert-circle-outline" size={16} color={colors.warning} style={{ marginRight: spacing.sm }} />
            <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 }}>
              Agrega al menos una cuenta antes para poder registrar tu ingreso aquí.
            </span>
          </div>
        ) : null}

        <div style={{ background: colors.surface, borderRadius: radius.card, paddingTop: spacing.xl, paddingBottom: spacing.xl, marginBottom: spacing.xl }}>
          <AmountInput value={amount} onChangeText={setAmount} size="amountMd" />
        </div>

        <div style={{ marginTop: spacing.xl }}>
          <span style={{ display: 'block', color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.8, marginBottom: spacing.md }}>
            DÍAS DE PAGO
          </span>
          <PaymentDayField label="Día de pago" state={firstDayState} onChange={setFirstDayState} />

          <div style={styles.switchRow}>
            <div style={{ flex: 1 }}>
              <p style={styles.switchLabel}>Tengo un segundo pago al mes</p>
              <p style={{ ...styles.switchHint, marginTop: 2 }}>
                Por ejemplo, si te pagan quincenal
              </p>
            </div>
            <Toggle value={hasSecondPayment} onChange={setHasSecondPayment} />
          </div>

          {hasSecondPayment ? (
            <PaymentDayField label="Día del segundo pago" state={secondDayState} onChange={setSecondDayState} />
          ) : null}
        </div>
      </div>

      <PrimaryButton label="Empezar" onPress={finish} disabled={!canFinish} loading={saving} style={{ marginTop: spacing.xl }} />
    </PageShell>
  );
}
