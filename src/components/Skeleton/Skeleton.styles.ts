import React from 'react';
import { colors, radius } from '../../theme/theme';

export const styles = {
  skeleton: (width: number | string, height: number, r: number): React.CSSProperties => ({
    display: 'inline-block',
    width,
    height,
    borderRadius: r,
  }),
  rowContainer: {
    display: 'flex',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  } as React.CSSProperties,
  rowTextWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  } as React.CSSProperties,
};
