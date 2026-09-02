import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const CARD_COLORS = [colors.accent, '#4E8DF2', '#B24EF2', '#F2914E', '#F2565B', '#4EF2C6'];

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
    width: '75%',
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
  input: {
    width: '100%',
    background: colors.surface,
    borderRadius: radius.input,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    border: 'none',
  },
  label: {
    display: 'block',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  hint: {
    display: 'block',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  twoCol: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  previewBox: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  colorsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  debtSwitchRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
};

export const dynamicStyles = {
  colorDot: (c: string, selected: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    background: c,
    border: selected ? `3px solid ${colors.textPrimary}` : '3px solid transparent',
    cursor: 'pointer',
  }),
  debtTrack: (hasDebt: boolean): React.CSSProperties => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    background: hasDebt ? colors.accent : colors.divider,
    position: 'relative',
    transition: 'background 0.15s ease',
  }),
  debtThumb: (hasDebt: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: 2,
    left: hasDebt ? 22 : 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    background: colors.white,
    transition: 'left 0.15s ease',
  }),
};
