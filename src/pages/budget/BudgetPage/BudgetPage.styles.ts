import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const DONUT_COLORS = ['#A8E0A0', '#8FC6E8', '#F2A6C6', '#C6A8E8', '#F2C48F', '#8FE0D1'];
export const DONUT_SIZE = 220;
export const DONUT_STROKE = 20;
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
