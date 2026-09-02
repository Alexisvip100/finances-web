import React from 'react';
import { colors, radius, spacing } from '../../theme/theme';

export const base: React.CSSProperties = {
  background: colors.surface,
  borderRadius: radius.card,
  padding: spacing.lg,
};

export const styles: Record<string, React.CSSProperties> = {
  base,
  pressable: {
    ...base,
    display: 'block',
    width: '100%',
    textAlign: 'left',
  },
};
