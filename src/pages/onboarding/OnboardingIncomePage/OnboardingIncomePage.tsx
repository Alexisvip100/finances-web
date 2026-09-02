import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { AmountInput } from '../../../components/AmountInput';
import { PaymentDayField } from '../../../components/PaymentDayField';
import { ErrorBanner } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { dynamicStyles, styles } from './OnboardingIncomePage.styles';
import { useOnboardingIncomePage } from './OnboardingIncomePage.hooks';

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
  const {
    navigate,
    accounts,
    error,
    amount,
    firstDayState,
    hasSecondPayment,
    secondDayState,
    saving,
    canFinish,
    setAmount,
    setFirstDayState,
    setHasSecondPayment,
    setSecondDayState,
    finish,
    handleSkip,
  } = useOnboardingIncomePage();

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
          <TextLinkButton label="Saltar" onPress={handleSkip} style={styles.skipBtn} />
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
