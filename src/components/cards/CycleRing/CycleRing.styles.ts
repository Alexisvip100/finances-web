import React from 'react';
import { colors, fontSize } from '../../../theme/theme';

export const styles = {
  container: (size: number): React.CSSProperties => ({
    width: size,
    height: size,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  svg: {
    position: 'absolute',
    inset: 0,
  } as React.CSSProperties,
  label: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.2,
  } as React.CSSProperties,
};
