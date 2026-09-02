import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const DAY_OPTIONS: (30 | 60 | 90)[] = [30, 60, 90];

export const styles: Record<string, React.CSSProperties> = {
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: 800,
    margin: 0,
  },
  summaryCard: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  daysFilter: {
    display: 'flex',
    justifyContent: 'center',
    background: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.md,
    width: 'fit-content',
    margin: `0 auto ${spacing.md}px`,
  },
  rangeText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timeline: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 8,
    bottom: 8,
    width: 2,
    background: colors.divider,
  },
  weekRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  weekTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 800,
    margin: 0,
  },
  weekRange: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    margin: '1px 0 0',
  },
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginLeft: 44,
    marginBottom: spacing.md,
  },
  eventLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 700,
    margin: 0,
  },
  eventMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    margin: '2px 0 0',
  },
};

export const dynamicStyles = {
  balanceText: (isNegative: boolean): React.CSSProperties => ({
    color: isNegative ? colors.danger : colors.accent,
    fontSize: fontSize.amountLg,
    fontWeight: 800,
    lineHeight: 1.1,
  }),
  dayOption: (active: boolean): React.CSSProperties => ({
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: radius.pill,
    background: active ? colors.accent : 'transparent',
    color: active ? colors.black : colors.textSecondary,
    fontWeight: 700,
    fontSize: fontSize.sm,
  }),
  weekBadge: (isFirst: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: 16,
    background: isFirst ? colors.accent : colors.surfaceAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
};
