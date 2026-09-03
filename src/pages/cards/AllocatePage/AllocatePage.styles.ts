import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%',
  },
  ringContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ringCenter: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ringPercent: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    fontWeight: 800,
  },
  ringMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  missingSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  infoBanner: {
    display: 'flex',
    flexDirection: 'row',
    background: colors.accentMuted,
    borderRadius: radius.input,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoIcon: {
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: '18px',
    margin: 0,
    whiteSpace: 'pre-line',
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: 800,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  amountRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dollarSign: {
    color: colors.textPrimary,
    fontSize: fontSize.amountMd,
    fontWeight: 800,
    lineHeight: 1.1,
    marginRight: spacing.xs,
  },
  amountInput: {
    color: colors.textPrimary,
    fontSize: fontSize.amountMd,
    fontWeight: 800,
    lineHeight: 1.1,
    minWidth: 80,
  },
  chipsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickChip: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: radius.pill,
    background: colors.surface,
  },
  accountsRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.lg,
  },
};

export const dynamicStyles = {
  accountChip: (active: boolean): React.CSSProperties => ({
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radius.pill,
    background: active ? colors.accent : colors.surface,
  }),
  accountChipText: (active: boolean): React.CSSProperties => ({
    color: active ? colors.accentContrast : colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
  }),
};
