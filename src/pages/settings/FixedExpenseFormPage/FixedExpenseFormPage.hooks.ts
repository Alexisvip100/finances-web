import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  createFixedExpenseThunk,
  deleteFixedExpenseThunk,
  updateFixedExpenseThunk,
} from '../../../store/slices/fixedExpensesSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import type { FixedExpenseFormPageTypes, SourceSelection } from './FixedExpenseFormPage.types';

export const useFixedExpenseFormPage = (): FixedExpenseFormPageTypes => {
  const navigate = useNavigate();
  const { fixedExpenseId } = useParams();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);
  const categories = useAppSelector((s) => s.categories.items);
  const error = useAppSelector((s) => s.fixedExpenses.error);
  const existing = useAppSelector((s) => s.fixedExpenses.items.find((f) => f.id === Number(fixedExpenseId)));
  const isEditing = existing !== undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? '');
  const [dayOfMonth, setDayOfMonth] = useState(existing ? String(existing.day_of_month) : '1');
  const [categoryId, setCategoryId] = useState<number | null>(existing?.category_id ?? null);
  const [source, setSource] = useState<SourceSelection>(
    existing
      ? existing.account_id
        ? { kind: 'account', id: existing.account_id }
        : { kind: 'card', id: existing.credit_card_id! }
      : null
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  useEffect(() => {
    if (!source && accounts.length > 0) setSource({ kind: 'account', id: accounts[0].id });
  }, [accounts, source]);

  const canSave = Boolean(
    name.trim() && Number(amount) > 0 && Number(dayOfMonth) >= 1 && Number(dayOfMonth) <= 31 && categoryId && source
  );

  const handleSave = async () => {
    if (!canSave || !source || !categoryId) return;
    setSaving(true);
    try {
      if (isEditing) {
        await dispatch(
          updateFixedExpenseThunk({
            id: existing.id,
            payload: { name: name.trim(), amount, day_of_month: Number(dayOfMonth), category_id: categoryId },
          })
        ).unwrap();
      } else {
        await dispatch(
          createFixedExpenseThunk({
            name: name.trim(),
            amount,
            day_of_month: Number(dayOfMonth),
            category_id: categoryId,
            account_id: source.kind === 'account' ? source.id : undefined,
            credit_card_id: source.kind === 'card' ? source.id : undefined,
          })
        ).unwrap();
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
      await dispatch(deleteFixedExpenseThunk(existing.id)).unwrap();
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
    accounts,
    cards,
    categories,
    error,
    name,
    amount,
    dayOfMonth,
    categoryId,
    source,
    saving,
    deleting,
    canSave,
    setName,
    setAmount,
    setDayOfMonth,
    setCategoryId,
    setSource,
    handleSave,
    handleDelete,
  };
};
