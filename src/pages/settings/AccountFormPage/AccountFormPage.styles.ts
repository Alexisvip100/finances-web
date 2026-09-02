import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  hintCard: {
    background: colors.surface,
    borderRadius: radius.input,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: '17px',
    margin: 0,
  },
  debitNotice: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.xl,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
};
