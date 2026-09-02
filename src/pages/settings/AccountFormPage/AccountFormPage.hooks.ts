import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createAccountThunk, deleteAccountThunk, updateAccountThunk } from '../../../store/slices/accountsSlice';
import { AccountType } from '../../../types';
import type { AccountFormPageTypes } from './AccountFormPage.types';

export const useAccountFormPage = (): AccountFormPageTypes => {
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
          updateAccountThunk({
            id: existing.id,
            payload: { name: name.trim(), bank: bank.trim() || undefined, balance: balance || '0' },
          })
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

  return {
    navigate,
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
  };
};
