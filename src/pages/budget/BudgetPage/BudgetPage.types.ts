import type { BudgetResponse, CategoryBudget } from '../../../types';

export interface DonutSegment {
  category: CategoryBudget;
  fraction: number;
  color: string;
}

export type CategoryFilterType = 'with_expense' | 'all' | 'without_expense' | 'over_budget';

export interface BudgetPageTypes {
  data: BudgetResponse | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  month: string;
  totalSpent: number;
  monthlyGoal: number | null;
  goalPercent: number | null;
  donutSegments: DonutSegment[];
  activeDonutIndex: number | null;
  setActiveDonutIndex: (index: number | null) => void;
  categoryFilter: CategoryFilterType;
  setCategoryFilter: (filter: CategoryFilterType) => void;
  filteredCategories: CategoryBudget[];
  counts: { all: number; withExpense: number; withoutExpense: number; overBudget: number };
  selectedCategory: CategoryBudget | null;
  editingId: number | null;
  editingName: string;
  editingLimit: string;
  savingEdit: boolean;
  deletingId: number | null;
  editingGoal: boolean;
  goalInput: string;
  savingGoal: boolean;
  setSelectedCategory: (cat: CategoryBudget | null) => void;
  setEditingId: (id: number | null) => void;
  setEditingName: (name: string) => void;
  setEditingLimit: (limit: string) => void;
  setEditingGoal: (editing: boolean) => void;
  setGoalInput: (val: string) => void;
  startEdit: (id: number | null, name: string, limit: string | null) => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<void>;
  handleDelete: (id: number | null) => Promise<void>;
  handleSaveGoal: () => Promise<void>;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  refresh: () => void;
}
