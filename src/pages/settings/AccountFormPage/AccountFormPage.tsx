import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { TextField } from '../../../components/TextField';
import { PrimaryButton, DangerButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { styles } from './AccountFormPage.styles';
import { useAccountFormPage } from './AccountFormPage.hooks';

export default function AccountFormPage() {
  const {
    isEditing,
    existing,
    error,
    name,
    type,
    bank,
    balance,
    saving,
    deleting,
    canSave,
    setName,
    setBank,
    setBalance,
    handleSave,
    handleDelete,
  } = useAccountFormPage();

  return (
    <PageShell>
      <TopBar title={isEditing ? 'Editar cuenta' : 'Agregar cuenta de efectivo'} />
      {error ? <ErrorBanner message={error} /> : null}

      {!isEditing ? (
        <div style={styles.hintCard}>
          <p style={styles.hintText}>
            Para tarjetas de débito o de crédito, agrégalas desde la pestaña Tarjetas. Aquí solo se agregan cuentas de efectivo.
          </p>
        </div>
      ) : type === 'DEBIT' ? (
        <p style={styles.debitNotice}>
          Esta es una tarjeta de débito (se agregó desde Tarjetas)
        </p>
      ) : null}

      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Efectivo" />

      {isEditing && type === 'DEBIT' ? (
        <TextField label="Banco" value={bank} onChangeText={setBank} placeholder="Ej. BBVA" />
      ) : null}

      <TextField
        label="Saldo actual"
        value={balance}
        onChangeText={(t) => setBalance(t.replace(/[^0-9.]/g, ''))}
        placeholder="0.00"
      />

      <PrimaryButton
        label={isEditing ? 'Guardar cambios' : 'Guardar cuenta'}
        onPress={handleSave}
        disabled={!canSave}
        loading={saving}
        style={styles.saveBtn}
      />

      {isEditing && existing && existing.type === 'CASH' ? (
        <DangerButton label="Eliminar cuenta" onPress={handleDelete} loading={deleting} style={styles.deleteBtn} />
      ) : null}
    </PageShell>
  );
}
