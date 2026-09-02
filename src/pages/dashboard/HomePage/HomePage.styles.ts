import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: 800,
    margin: 0,
  },
  periodText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  mainCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  mainCardLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: 800,
    letterSpacing: 0.6,
  },
  mainCardAmount: {
    color: colors.accent,
    fontSize: fontSize.amountLg,
    fontWeight: 800,
    lineHeight: 1.05,
    marginTop: spacing.xs,
  },
  mainCardSub: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  breakdownCard: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    marginBottom: spacing.xl,
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
  sectionAction: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
};

export const dynamicStyles = {
  breakdownRow: (last?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md}px 0`,
    borderBottom: last ? 'none' : `1px solid ${colors.divider}`,
  }),
};
