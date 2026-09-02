import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, spacing } from '../../../theme/theme';
import { styles } from './OnboardingAccountsPage.styles';
import { useOnboardingAccountsPage } from './OnboardingAccountsPage.hooks';

export default function OnboardingAccountsPage() {
  const {
    cashBalance,
    debitAccounts,
    saving,
    error,
    setCashBalance,
    updateDebit,
    addDebit,
    handleNext,
    handleSkip,
  } = useOnboardingAccountsPage();

  return (
    <PageShell contentStyle={styles.content}>
      <div style={{ flex: 1 }}>
        <div style={styles.progressRow}>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
          <TextLinkButton label="Saltar" onPress={handleSkip} style={styles.skipBtn} />
        </div>

        <h1 style={styles.title}>
          ¿Con qué te mueves?
        </h1>
        <p style={styles.subtitle}>
          Configura tus saldos iniciales para un seguimiento preciso.
        </p>

        {error ? <ErrorBanner message={error} /> : null}

        <div style={styles.card}>
          <div style={styles.headerIconRow}>
            <Icon name="cash-outline" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
            <span style={styles.headerLabel}>Efectivo</span>
          </div>
          <div style={styles.inputBox}>
            <span style={styles.dollarSign}>$</span>
            <input
              value={cashBalance}
              onChange={(e) => setCashBalance(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              inputMode="decimal"
              style={styles.moneyInput}
            />
          </div>
        </div>

        <p style={styles.sectionHeader}>
          Cuentas de débito
        </p>

        {debitAccounts.map((item) => (
          <div key={item.key} style={styles.card}>
            <div style={styles.headerIconRow}>
              <Icon name="card-outline" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
              <input
                value={item.name}
                onChange={(e) => updateDebit(item.key, { name: e.target.value })}
                placeholder="Nombre (ej. Nómina BBVA)"
                style={styles.accountNameInput}
              />
            </div>
            <div style={styles.inputBox}>
              <span style={styles.dollarSign}>$</span>
              <input
                value={item.balance}
                onChange={(e) => updateDebit(item.key, { balance: e.target.value.replace(/[^0-9.]/g, '') })}
                placeholder="0.00"
                inputMode="decimal"
                style={styles.moneyInput}
              />
            </div>
          </div>
        ))}

        <Pressable
          onClick={addDebit}
          style={styles.addBtn}
        >
          <Icon name="add" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
          <span style={styles.addBtnText}>Agregar otra cuenta de débito</span>
        </Pressable>
      </div>

      <PrimaryButton label="Siguiente" onPress={handleNext} loading={saving} style={{ marginTop: spacing.xl }} />
    </PageShell>
  );
}
