import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, marginBottom: spacing.sm, marginTop: spacing.lg },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.sm },
  input: {
    width: '100%',
    background: colors.surface,
    borderRadius: radius.input,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    border: 'none',
    boxSizing: 'border-box',
  },
  twoCol: { display: 'flex', flexDirection: 'row', gap: spacing.lg },
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
