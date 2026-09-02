import React from 'react';
import { colors, fontSize, spacing } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  pageContent: {
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100%',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: 800,
    marginBottom: spacing.xxxl,
    textAlign: 'center',
  },
  brandAccent: {
    color: colors.accent,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: 800,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xxl,
    lineHeight: '21px',
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
};
