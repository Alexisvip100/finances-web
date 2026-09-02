import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  amountCard: { background: colors.surface, borderRadius: radius.card, paddingTop: spacing.xl, paddingBottom: spacing.xl, marginBottom: spacing.xl },
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, marginBottom: spacing.sm, marginTop: spacing.lg },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.sm },
  switchRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  switchLabel: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 },
  chipsRow: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: radius.pill,
    background: colors.surface,
    border: 'none',
    cursor: 'pointer',
  },
  chipActive: { background: colors.accentMuted, border: `1px solid ${colors.accent}` },
  chipDisabled: { opacity: 0.6 },
  chipLabel: { color: colors.textSecondary, fontWeight: 600, fontSize: fontSize.sm },
  chipLabelActive: { color: colors.accent },
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
};
