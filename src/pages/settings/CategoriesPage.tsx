import React, { useEffect, useState } from 'react';
import { PageShell } from '../../components/PageShell';
import { TopBar } from '../../components/TopBar';
import { Pressable } from '../../components/Pressable';
import { Icon } from '../../components/Icon';
import { ErrorBanner, IconCircle } from '../../components/Misc';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { createCategoryThunk, deleteCategoryThunk, fetchCategoriesThunk, updateCategoryThunk } from '../../store/slices/categoriesSlice';
import { formatMoney } from '../../utils/currency';

const plainInputStyle: React.CSSProperties = { color: colors.textPrimary, background: 'none', border: 'none', padding: 0 };

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.categories);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLimit, setEditingLimit] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        updateCategoryThunk({ id: editingId, payload: { name: editingName.trim(), monthly_limit: editingLimit || undefined } })
      ).unwrap();
      setEditingId(null);
    } catch {
      // el error ya se muestra desde el banner de arriba
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <TopBar title="Categorías y límites" />
      {error ? <ErrorBanner message={error} onRetry={() => dispatch(fetchCategoriesThunk())} /> : null}

      {items.map((c) => {
        const isEditing = editingId === c.id;
        return (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: colors.surface,
              borderRadius: radius.card,
              padding: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <IconCircle name={categoryIcons[c.name] ?? 'file-tray-outline'} bg={colors.surfaceAlt} color={colors.textSecondary} size={40} />
            <div style={{ flex: 1, marginLeft: spacing.md }}>
              {isEditing ? (
                <>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nombre"
                    autoFocus
                    style={{ ...plainInputStyle, fontSize: fontSize.md, fontWeight: 700, width: '100%' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: spacing.sm }}>
                    <span style={{ color: colors.accent, fontWeight: 700, marginRight: 2 }}>Límite $</span>
                    <input
                      value={editingLimit}
                      onChange={(e) => setEditingLimit(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="Sin límite"
                      style={{ ...plainInputStyle, fontSize: fontSize.sm, fontWeight: 700, minWidth: 60, flex: 1 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md }}>
                    <Pressable
                      onClick={cancelEdit}
                      style={{ paddingLeft: spacing.lg, paddingRight: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, borderRadius: radius.pill, background: colors.surfaceAlt }}
                    >
                      <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>Cancelar</span>
                    </Pressable>
                    <Pressable
                      onClick={saveEdit}
                      disabled={saving}
                      style={{ paddingLeft: spacing.lg, paddingRight: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, borderRadius: radius.pill, background: colors.accent }}
                    >
                      <span style={{ color: colors.black, fontWeight: 700, fontSize: fontSize.sm }}>{saving ? 'Guardando…' : 'Guardar'}</span>
                    </Pressable>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>{c.name}</p>
                  <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                    {c.monthly_limit ? `Límite: ${formatMoney(c.monthly_limit)}` : 'Sin límite'}
                  </p>
                </>
              )}
            </div>
            {!isEditing ? (
              <>
                <Pressable onClick={() => startEdit(c.id, c.name, c.monthly_limit ?? null)} style={{ padding: spacing.sm }}>
                  <Icon name="pencil-outline" size={16} color={colors.textSecondary} />
                </Pressable>
                <Pressable onClick={() => dispatch(deleteCategoryThunk(c.id))} style={{ padding: spacing.sm }}>
                  <Icon name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              </>
            ) : null}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.lg }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          style={{ flex: 1, background: colors.surface, borderRadius: radius.input, padding: spacing.lg, color: colors.textPrimary, fontSize: fontSize.md, border: 'none' }}
        />
        <Pressable onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, borderRadius: radius.input, background: colors.accent }}>
          <Icon name="add" size={18} color={colors.black} />
        </Pressable>
      </div>
    </PageShell>
  );
}
