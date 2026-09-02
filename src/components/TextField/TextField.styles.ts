import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    display: 'block',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    background: colors.surface,
    borderRadius: radius.input,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
};
