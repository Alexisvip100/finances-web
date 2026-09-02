import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchBudgetThunk, setMonth } from '../../../store/slices/budgetSlice';
import { deleteCategoryThunk, updateCategoryThunk } from '../../../store/slices/categoriesSlice';
import { updateSpendingGoalThunk } from '../../../store/slices/authSlice';
import { shiftMonthKey } from '../../../utils/dateHelpers';
import type { CategoryBudget } from '../../../types';
import { DONUT_COLORS } from './BudgetPage.styles';
import type { BudgetPageTypes } from './BudgetPage.types';

export const useBudgetPage = (): BudgetPageTypes => {
  const dispatch = useAppDispatch();
  const { data, status, error, month } = useAppSelector((s) => s.budget);

  const [selectedCategory, setSelectedCategory] = useState<CategoryBudget | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLimit, setEditingLimit] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    dispatch(fetchBudgetThunk(month));
  }, [dispatch, month]);

  const totalSpent = useMemo(() => {
    if (!data) return 0;
    return data.categories.reduce((acc, c) => acc + Number(c.spent), 0);
  }, [data]);

  const monthlyGoal = data?.spending_goal ? Number(data.spending_goal) : null;
  const goalPercent = monthlyGoal && monthlyGoal > 0 ? Math.round((totalSpent / monthlyGoal) * 100) : null;

  const donutSegments = useMemo(() => {
    if (!data || totalSpent === 0) return [];
    return data.categories
      .filter((c) => Number(c.spent) > 0)
      .map((c, i) => ({
        category: c,
        fraction: Number(c.spent) / totalSpent,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
  }, [data, totalSpent]);

  const startEdit = (id: number | null, name: string, limit: string | null) => {
    if (id === null) return;
    setEditingId(id);
    setEditingName(name);
    setEditingLimit(limit ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (editingId === null || !editingName.trim()) return;
    setSavingEdit(true);
    try {
      await dispatch(
        updateCategoryThunk({
          id: editingId,
          payload: { name: editingName.trim(), monthly_limit: editingLimit || undefined },
        })
      ).unwrap();
      dispatch(fetchBudgetThunk(month));
      setEditingId(null);
    } catch {
      // slice
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: number | null) => {
    if (id === null) return;
    setDeletingId(id);
    try {
      await dispatch(deleteCategoryThunk(id)).unwrap();
      dispatch(fetchBudgetThunk(month));
    } catch {
      // slice
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveGoal = async () => {
    setSavingGoal(true);
    try {
      await dispatch(updateSpendingGoalThunk(goalInput ? goalInput : null)).unwrap();
      dispatch(fetchBudgetThunk(month));
      setEditingGoal(false);
    } catch {
      // slice
    } finally {
      setSavingGoal(false);
    }
  };

  const handlePrevMonth = () => {
    dispatch(setMonth(shiftMonthKey(month, -1)));
  };

  const handleNextMonth = () => {
    dispatch(setMonth(shiftMonthKey(month, 1)));
  };

  const refresh = () => {
    dispatch(fetchBudgetThunk(month));
  };

  return {
    data,
    status,
    error,
    month,
    totalSpent,
    monthlyGoal,
    goalPercent,
    donutSegments,
    selectedCategory,
    editingId,
    editingName,
    editingLimit,
    savingEdit,
    deletingId,
    editingGoal,
    goalInput,
    savingGoal,
    setSelectedCategory,
    setEditingId,
    setEditingName,
    setEditingLimit,
    setEditingGoal,
    setGoalInput,
    startEdit,
    cancelEdit,
    saveEdit,
    handleDelete,
    handleSaveGoal,
    handlePrevMonth,
    handleNextMonth,
    refresh,
  };
};
