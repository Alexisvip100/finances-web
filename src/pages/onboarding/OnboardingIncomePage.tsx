import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../components/Buttons';
import { AmountInput } from '../../components/AmountInput';
import { PaymentDayField } from '../../components/PaymentDayField';
import { ErrorBanner } from '../../components/Misc';
import { Icon } from '../../components/Icon';
import { Pressable } from '../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { createIncomeThunk } from '../../store/slices/incomesSlice';
import { fetchAccountsThunk } from '../../store/slices/accountsSlice';
import { PaymentDay } from '../../types';
import { PaymentDayState, resolvePaymentDayValue } from '../../utils/paymentDay';

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
      <span style={{ width: 22, height: 22, borderRadius: 11, background: colors.white, display: 'block' }} />
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
    <PageShell contentStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.xxl, gap: spacing.md }}>
          <Pressable onClick={() => navigate(-1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-back" size={18} color={colors.accent} />
          </Pressable>
          <div style={{ flex: 1, height: 3, background: colors.divider, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: 3, width: '100%', background: colors.accent }} />
          </div>
          <TextLinkButton label="Saltar" onPress={() => navigate('/')} style={{ padding: 0 }} />
        </div>

        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, marginBottom: spacing.sm, margin: `0 0 ${spacing.sm}px` }}>
          ¿Cuándo te pagan?
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.md, lineHeight: '21px', marginBottom: spacing.xl, margin: `0 0 ${spacing.xl}px` }}>
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

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>Tengo un segundo pago al mes</p>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: -spacing.sm, marginBottom: spacing.lg, margin: 0 }}>
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
