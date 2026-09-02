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
    width: '100%',
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
  amountCard: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
    marginBottom: spacing.md,
    margin: `0 0 ${spacing.md}px`,
  },
  switchRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  switchLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 700,
    margin: 0,
  },
  switchHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    margin: '2px 0 0',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  accountChipsRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
};

export const dynamicStyles = {
  toggleBtn: (value: boolean): React.CSSProperties => ({
    width: 44,
    height: 26,
    borderRadius: 13,
    background: value ? colors.accent : colors.divider,
    border: 'none',
    padding: 2,
    display: 'flex',
    justifyContent: value ? 'flex-end' : 'flex-start',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s ease',
  }),
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    background: colors.white,
    display: 'block',
  } as React.CSSProperties,
  accountChip: (active: boolean): React.CSSProperties => ({
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: radius.pill,
    background: active ? colors.accentMuted : colors.surface,
    border: active ? `1px solid ${colors.accent}` : 'none',
  }),
  accountChipText: (active: boolean): React.CSSProperties => ({
    color: active ? colors.accent : colors.textSecondary,
    fontWeight: 600,
    fontSize: fontSize.sm,
  }),
};
