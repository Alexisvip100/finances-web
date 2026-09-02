import type { Category } from '../../../types';

export interface CategoriesPageTypes {
  items: Category[];
  error: string | null;
  newName: string;
  editingId: number | null;
  editingName: string;
  editingLimit: string;
  saving: boolean;
  setNewName: (name: string) => void;
  setEditingName: (name: string) => void;
  setEditingLimit: (limit: string) => void;
  handleAdd: () => Promise<void>;
  startEdit: (id: number, name: string, currentLimit: string | null) => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  refresh: () => void;
}
