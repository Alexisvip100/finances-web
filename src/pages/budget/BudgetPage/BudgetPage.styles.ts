import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const DONUT_COLORS = [
  '#10B981', // Verde esmeralda
  '#3B82F6', // Azul eléctrico
  '#F59E0B', // Ámbar dorado
  '#8B5CF6', // Violeta intenso
  '#EC4899', // Rosa fucsia
  '#06B6D4', // Cian brillante
  '#F97316', // Naranja vivo
  '#6366F1', // Índigo
  '#84CC16', // Lima
  '#E11D48', // Carmesí / Rojo
];
export const DONUT_SIZE = 220;
export const DONUT_STROKE = 22;
export const DONUT_EASE = [0.32, 0.72, 0, 1] as const;

export const editInputStyle: React.CSSProperties = {
  color: colors.textPrimary,
  background: 'none',
  border: 'none',
  padding: 0,
};

export const iconBtnStyle: React.CSSProperties = {
  padding: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  background: colors.surfaceAlt,
};

export const styles: Record<string, React.CSSProperties> = {
  editInput: editInputStyle,
  iconBtn: iconBtnStyle,
  monthRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  monthArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 700,
    minWidth: 140,
    textAlign: 'center',
  },
  card: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  donutWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: `${spacing.lg}px 0`,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: 800,
    margin: 0,
  },
};

export const dynamicStyles = {
  categoryItem: (overBudget: boolean, isEditing: boolean): React.CSSProperties => ({
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    border: overBudget ? `1px solid ${colors.danger}` : 'none',
    cursor: isEditing ? 'default' : 'pointer',
  }),
};
