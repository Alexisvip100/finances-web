import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const CARD_COLORS = [colors.accent, '#4E8DF2', '#B24EF2', '#F2914E', '#F2565B', '#4EF2C6'];

export const labelStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: fontSize.sm,
  fontWeight: 600,
  marginBottom: spacing.sm,
  marginTop: spacing.lg,
};

export const hintStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: fontSize.xs,
  marginBottom: spacing.sm,
  marginTop: -spacing.xs,
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: colors.surface,
  borderRadius: radius.input,
  padding: spacing.lg,
  color: colors.textPrimary,
  fontSize: fontSize.md,
};

export const twoColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: spacing.lg,
};

export const styles: Record<string, React.CSSProperties> = {
  label: labelStyle,
  hint: hintStyle,
  input: inputStyle,
  twoCol: twoColStyle,
  modeTabs: {
    display: 'flex',
    flexDirection: 'row',
    background: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.xl,
  },
  debtSwitchRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  previewBanner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    background: colors.accentMuted,
    borderRadius: radius.input,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
};

export const dynamicStyles = {
  modeTab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: `${spacing.md}px 0`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    background: active ? colors.accent : 'transparent',
  }),
  modeText: (active: boolean): React.CSSProperties => ({
    color: active ? colors.accentContrast : colors.textSecondary,
    fontWeight: 700,
    fontSize: fontSize.sm,
  }),
  colorDot: (c: string, selected: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    background: c,
    border: `2px solid ${selected ? colors.textPrimary : 'transparent'}`,
  }),
  debtSwitchTrack: (hasDebt: boolean): React.CSSProperties => ({
    width: 44,
    height: 26,
    borderRadius: 13,
    background: hasDebt ? colors.accent : colors.divider,
    position: 'relative',
    flexShrink: 0,
  }),
  debtSwitchThumb: (hasDebt: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: 3,
    left: hasDebt ? 21 : 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    background: colors.white,
    transition: 'left 0.15s ease',
  }),
};
