import React from 'react';
import { colors, fontSize, letterSpacing, radius, spacing } from '../../../theme/theme';

export const styles = {
  card: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    flex: 1,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as React.CSSProperties,
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: 700,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
  } as React.CSSProperties,
  value: (color: string, size: 'amountSm' | 'amountMd' | 'amountLg'): React.CSSProperties => ({
    color,
    fontWeight: 800,
    fontSize: fontSize[size],
    lineHeight: 1.1,
  }),
  miniStatContainer: {
    flex: 1,
  } as React.CSSProperties,
  miniStatLabel: {
    display: 'block',
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: 700,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
  } as React.CSSProperties,
  miniStatValue: (color: string): React.CSSProperties => ({
    display: 'block',
    fontSize: fontSize.lg,
    fontWeight: 800,
    marginTop: 2,
    color,
  }),
};
