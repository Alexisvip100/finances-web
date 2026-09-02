import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  createCategoryThunk,
  deleteCategoryThunk,
  fetchCategoriesThunk,
  updateCategoryThunk,
} from '../../../store/slices/categoriesSlice';
import type { CategoriesPageTypes } from './CategoriesPage.types';

export const useCategoriesPage = (): CategoriesPageTypes => {
  const dispatch = useAppDispatch();
  const { items, error } = useAppSelector((s) => s.categories);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLimit, setEditingLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    dispatch(fetchCategoriesThunk());
  };

  useEffect(() => {
    refresh();
  }, [dispatch]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await dispatch(createCategoryThunk({ name: newName.trim() }));
    setNewName('');
  };

  const startEdit = (id: number, name: string, currentLimit: string | null) => {
    setEditingId(id);
    setEditingName(name);
    setEditingLimit(currentLimit ?? '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (editingId === null || !editingName.trim()) return;
    setSaving(true);
    try {
      await dispatch(
        updateCategoryThunk({
          id: editingId,
          payload: { name: editingName.trim(), monthly_limit: editingLimit || undefined },
        })
      ).unwrap();
      setEditingId(null);
    } catch {
      // el error ya se muestra desde el banner de arriba
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteCategoryThunk(id));
  };

  return {
    items,
    error,
    newName,
    editingId,
    editingName,
    editingLimit,
    saving,
    setNewName,
    setEditingName,
    setEditingLimit,
    handleAdd,
    startEdit,
    cancelEdit,
    saveEdit,
    handleDelete,
    refresh,
  };
};
