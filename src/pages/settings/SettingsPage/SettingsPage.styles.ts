import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  sectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: 800,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 700,
    margin: 0,
  },
  settingMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    margin: '2px 0 0',
  },
  themeToggleRow: {
    display: 'flex',
    background: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.xl,
  },
  addBtn: {
    border: `1px dashed ${colors.divider}`,
    borderRadius: radius.card,
    padding: spacing.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  addBtnText: {
    color: colors.textSecondary,
    fontWeight: 700,
  },
};

export const dynamicStyles = {
  themeTab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radius.pill,
    background: active ? colors.accent : 'transparent',
    color: active ? colors.accentContrast : colors.textSecondary,
    fontWeight: 700,
    fontSize: fontSize.sm,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  }),
};
