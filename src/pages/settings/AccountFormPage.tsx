import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PrimaryButton, DangerButton } from '../../components/Buttons';
import { ErrorBanner } from '../../components/Misc';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { createAccountThunk, deleteAccountThunk, updateAccountThunk } from '../../store/slices/accountsSlice';
import { AccountType } from '../../types';

export default function AccountFormPage() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.accounts.error);
  const existing = useAppSelector((s) => s.accounts.items.find((a) => a.id === Number(accountId)));
  const isEditing = existing !== undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [type] = useState<AccountType>(existing?.type ?? 'CASH');
  const [bank, setBank] = useState(existing?.bank ?? '');
  const [balance, setBalance] = useState(existing?.balance ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isEditing) {
        await dispatch(
          updateAccountThunk({ id: existing.id, payload: { name: name.trim(), bank: bank.trim() || undefined, balance: balance || '0' } })
        ).unwrap();
      } else {
        await dispatch(createAccountThunk({ name: name.trim(), type, balance: balance || '0' })).unwrap();
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
      await dispatch(deleteAccountThunk(existing.id)).unwrap();
      navigate(-1);
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell>
      <TopBar title={isEditing ? 'Editar cuenta' : 'Agregar cuenta de efectivo'} />
      {error ? <ErrorBanner message={error} /> : null}

      {!isEditing ? (
        <div style={{ background: colors.surface, borderRadius: radius.input, padding: spacing.md, marginBottom: spacing.lg }}>
          <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: '17px', margin: 0 }}>
            Para tarjetas de débito o de crédito, agrégalas desde la pestaña Tarjetas. Aquí solo se agregan cuentas de efectivo.
          </p>
        </div>
      ) : type === 'DEBIT' ? (
        <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.sm }}>
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

      <PrimaryButton label={isEditing ? 'Guardar cambios' : 'Guardar cuenta'} onPress={handleSave} disabled={!canSave} loading={saving} style={{ marginTop: spacing.xl }} />
      {isEditing ? <DangerButton label="Eliminar cuenta" onPress={handleDelete} loading={deleting} style={{ marginTop: spacing.md }} /> : null}
    </PageShell>
  );
}
