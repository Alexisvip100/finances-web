import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../components/Buttons';
import { ErrorBanner } from '../../components/Misc';
import { Icon } from '../../components/Icon';
import { Pressable } from '../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { createAccountThunk } from '../../store/slices/accountsSlice';

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
    <PageShell contentStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.xxl }}>
          <div style={{ flex: 1, height: 3, background: colors.divider, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: 3, width: '50%', background: colors.accent }} />
          </div>
          <TextLinkButton label="Saltar" onPress={() => navigate('/onboarding/primera-tarjeta')} style={{ padding: 0, marginLeft: spacing.lg }} />
        </div>

        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, marginBottom: spacing.sm, margin: `0 0 ${spacing.sm}px` }}>
          ¿Con qué te mueves?
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.md, lineHeight: '21px', marginBottom: spacing.xxl, margin: `0 0 ${spacing.xxl}px` }}>
          Configura tus saldos iniciales para un seguimiento preciso.
        </p>

        {error ? <ErrorBanner message={error} /> : null}

        <div style={{ background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.md }}>
            <Icon name="cash-outline" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
            <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>Efectivo</span>
          </div>
          <div style={{ background: colors.surfaceAlt, borderRadius: radius.input, padding: spacing.md, display: 'flex', alignItems: 'center', marginTop: spacing.sm }}>
            <span style={{ color: colors.accent, fontSize: fontSize.xxl, fontWeight: 800, marginRight: spacing.xs }}>$</span>
            <input
              value={cashBalance}
              onChange={(e) => setCashBalance(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              inputMode="decimal"
              style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, padding: 0, background: 'none', border: 'none' }}
            />
          </div>
        </div>

        {debitAccounts.map((debit) => (
          <div key={debit.key} style={{ background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginBottom: spacing.lg }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.md }}>
              <Icon name="business-outline" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
              <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>Nombre de cuenta de débito</span>
            </div>
            <input
              value={debit.name}
              onChange={(e) => updateDebit(debit.key, { name: e.target.value })}
              placeholder="Ej. Banamex Débito"
              style={{
                width: '100%',
                background: colors.surfaceAlt,
                borderRadius: radius.input,
                padding: spacing.md,
                color: colors.textPrimary,
                fontSize: fontSize.md,
                border: 'none',
              }}
            />
            <span style={{ display: 'block', color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, marginTop: spacing.lg }}>
              Saldo actual
            </span>
            <div style={{ background: colors.surfaceAlt, borderRadius: radius.input, padding: spacing.md, display: 'flex', alignItems: 'center', marginTop: spacing.sm }}>
              <span style={{ color: colors.accent, fontSize: fontSize.xxl, fontWeight: 800, marginRight: spacing.xs }}>$</span>
              <input
                value={debit.balance}
                onChange={(e) => updateDebit(debit.key, { balance: e.target.value.replace(/[^0-9.]/g, '') })}
                placeholder="0.00"
                inputMode="decimal"
                style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, padding: 0, background: 'none', border: 'none' }}
              />
            </div>
          </div>
        ))}

        <Pressable
          onClick={addDebit}
          style={{
            width: '100%',
            border: `1px dashed ${colors.divider}`,
            borderRadius: radius.card,
            padding: spacing.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: colors.accent, fontWeight: 700 }}>+ Agregar otra cuenta</span>
        </Pressable>
      </div>

      <PrimaryButton label="Siguiente" onPress={handleNext} loading={saving} style={{ marginTop: spacing.xl }} />
    </PageShell>
  );
}
