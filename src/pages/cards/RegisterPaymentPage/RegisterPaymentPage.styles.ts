import React from 'react';
import { colors, radius, spacing } from '../../../theme/theme';

export const optionRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  background: colors.surface,
  borderRadius: radius.card,
  border: '1.5px solid transparent',
  padding: spacing.lg,
  marginBottom: spacing.md,
  gap: spacing.md,
  width: '100%',
  textAlign: 'left',
};

export const radioStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 10,
  border: `2px solid ${colors.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export const radioDotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 5,
  background: colors.accent,
};

export const sourceChipStyle: React.CSSProperties = {
  padding: `${spacing.md}px ${spacing.md}px`,
  borderRadius: radius.pill,
  background: colors.surface,
};

export const styles: Record<string, React.CSSProperties> = {
  optionRow: optionRowStyle,
  radio: radioStyle,
  radioDot: radioDotStyle,
  sourceChip: sourceChipStyle,
};
