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
    width: '25%',
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
    marginBottom: spacing.md,
    lineHeight: '30px',
    margin: `0 0 ${spacing.md}px`,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: '22px',
    marginBottom: spacing.xxxl,
    margin: `0 0 ${spacing.xxxl}px`,
  },
  card: {
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  cardTitle: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: 700,
    marginBottom: spacing.xl,
    margin: `0 0 ${spacing.xl}px`,
  },
  blocksColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cardBlock: {
    borderRadius: radius.input,
    padding: spacing.lg,
    background: colors.accent,
    marginLeft: 0,
    marginRight: '18%',
  },
  monthBlock: {
    borderRadius: radius.input,
    padding: spacing.lg,
    background: colors.surfaceAlt,
    marginLeft: '12%',
    marginRight: 0,
  },
  blockTitleDark: {
    color: colors.black,
    fontWeight: 800,
    fontSize: fontSize.md,
    margin: 0,
  },
  blockSubDark: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: fontSize.sm,
    marginTop: 2,
    margin: '2px 0 0',
  },
  blockTitleLight: {
    color: colors.textPrimary,
    fontWeight: 800,
    fontSize: fontSize.md,
    margin: 0,
  },
  blockSubLight: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
    margin: '2px 0 0',
  },
  monthsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: `1px solid ${colors.divider}`,
    paddingTop: spacing.md,
  },
  monthLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
};
