import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, DangerButton } from '../../../components/Buttons';
import { AmountInput } from '../../../components/AmountInput';
import { PaymentDayField } from '../../../components/PaymentDayField';
import { ErrorBanner } from '../../../components/Misc';
import { spacing } from '../../../theme/theme';
import { accountLabel } from '../../../utils/labels';
import { dynamicStyles, styles } from './IncomeFormPage.styles';
import { useIncomeFormPage } from './IncomeFormPage.hooks';

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
  const {
    navigate,
    isEditing,
    accounts,
    error,
    amount,
    firstDayState,
    hasSecondPayment,
    secondDayState,
    accountId,
    saving,
    deleting,
    canSave,
    setAmount,
    setFirstDayState,
    setHasSecondPayment,
    setSecondDayState,
    setAccountId,
    handleSave,
    handleDelete,
  } = useIncomeFormPage();

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
