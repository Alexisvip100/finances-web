import React from 'react';
import { colors, fontSize, spacing } from '../../theme/theme';

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  dollar: (size: 'amountSm' | 'amountMd' | 'amountLg'): React.CSSProperties => ({
    color: colors.textPrimary,
    fontWeight: 800,
    lineHeight: 1.1,
    marginRight: spacing.xs,
    fontSize: fontSize[size],
  }),
  input: (size: 'amountSm' | 'amountMd' | 'amountLg'): React.CSSProperties => ({
    color: colors.textPrimary,
    fontWeight: 800,
    lineHeight: 1.1,
    padding: 0,
    minWidth: 40,
    fontSize: fontSize[size],
    textAlign: 'center',
  }),
};
