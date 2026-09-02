import React from 'react';
import { colors, radius } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    background: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
