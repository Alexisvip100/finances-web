import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createAccountThunk } from '../../../store/slices/accountsSlice';
import { styles } from './OnboardingAccountsPage.styles';

interface DraftDebitAccount {
  key: string;
  name: string;
  balance: string;
}

export default function OnboardingAccountsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.accounts);
  const [cashBalance, setCashBalance] = useState('');
  const [debitAccounts, setDebitAccounts] = useState<DraftDebitAccount[]>([
    { key: 'debit-1', name: '', balance: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const updateDebit = (key: string, patch: Partial<DraftDebitAccount>) => {
    setDebitAccounts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const addDebit = () => {
    setDebitAccounts((prev) => [...prev, { key: `debit-${prev.length + 1}-${Date.now()}`, name: '', balance: '' }]);
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (Number(cashBalance) > 0 || cashBalance !== '') {
        await dispatch(
          createAccountThunk({ name: 'Efectivo', type: 'CASH', balance: cashBalance || '0' })
        ).unwrap();
      }
      for (const debit of debitAccounts) {
        if (debit.name.trim()) {
          await dispatch(
            createAccountThunk({ name: debit.name.trim(), type: 'DEBIT', balance: debit.balance || '0' })
          ).unwrap();
        }
      }
      navigate('/onboarding/primera-tarjeta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell contentStyle={styles.content}>
      <div style={{ flex: 1 }}>
        <div style={styles.progressRow}>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
          <TextLinkButton label="Saltar" onPress={() => navigate('/onboarding/primera-tarjeta')} style={styles.skipBtn} />
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

        {debitAccounts.map((debit) => (
          <div key={debit.key} style={styles.card}>
            <div style={styles.headerIconRow}>
              <Icon name="business-outline" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
              <span style={styles.headerLabel}>Nombre de cuenta de débito</span>
            </div>
            <input
              value={debit.name}
              onChange={(e) => updateDebit(debit.key, { name: e.target.value })}
              placeholder="Ej. Banamex Débito"
              style={styles.textInput}
            />
            <span style={styles.fieldLabel}>
              Saldo actual
            </span>
            <div style={styles.inputBox}>
              <span style={styles.dollarSign}>$</span>
              <input
                value={debit.balance}
                onChange={(e) => updateDebit(debit.key, { balance: e.target.value.replace(/[^0-9.]/g, '') })}
                placeholder="0.00"
                inputMode="decimal"
                style={styles.moneyInput}
              />
            </div>
          </div>
        ))}

        <Pressable
          onClick={addDebit}
          style={styles.addAccountBtn}
        >
          <span style={styles.addAccountText}>+ Agregar otra cuenta</span>
        </Pressable>
      </div>

      <PrimaryButton label="Siguiente" onPress={handleNext} loading={saving} style={{ marginTop: spacing.xl }} />
    </PageShell>
  );
}
