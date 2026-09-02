import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  progressBar: {
    flex: 1,
    height: 3,
    background: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    width: '50%',
    background: colors.accent,
  },
  skipBtn: {
    padding: 0,
    marginLeft: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: 800,
    marginBottom: spacing.sm,
    margin: `0 0 ${spacing.sm}px`,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: '21px',
    marginBottom: spacing.xxl,
    margin: `0 0 ${spacing.xxl}px`,
  },
  card: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerIconRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
  },
  inputBox: {
    background: colors.surfaceAlt,
    borderRadius: radius.input,
    padding: spacing.md,
    display: 'flex',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dollarSign: {
    color: colors.accent,
    fontSize: fontSize.xxl,
    fontWeight: 800,
    marginRight: spacing.xs,
  },
  moneyInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: 800,
    padding: 0,
    background: 'none',
    border: 'none',
  },
  textInput: {
    width: '100%',
    background: colors.surfaceAlt,
    borderRadius: radius.input,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    border: 'none',
  },
  fieldLabel: {
    display: 'block',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
    marginTop: spacing.lg,
  },
  addAccountBtn: {
    width: '100%',
    border: `1px dashed ${colors.divider}`,
    borderRadius: radius.card,
    padding: spacing.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAccountText: {
    color: colors.accent,
    fontWeight: 700,
  },
};
