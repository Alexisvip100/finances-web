import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const plainInputStyle: React.CSSProperties = {
  color: colors.textPrimary,
  background: 'none',
  border: 'none',
  padding: 0,
};

export const styles: Record<string, React.CSSProperties> = {
  plainInput: plainInputStyle,
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  addCategoryRow: {
    display: 'flex',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addInput: {
    flex: 1,
    background: colors.surface,
    borderRadius: radius.input,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    border: 'none',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    borderRadius: radius.input,
    background: colors.accent,
  },
  cancelBtn: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radius.pill,
    background: colors.surfaceAlt,
  },
  saveBtn: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radius.pill,
    background: colors.accent,
  },
  actionIconBtn: {
    padding: spacing.sm,
  },
};
