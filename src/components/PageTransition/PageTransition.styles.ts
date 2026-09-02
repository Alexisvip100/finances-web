import React from 'react';
import { colors } from '../../theme/theme';

export const IOS_EASE = [0.32, 0.72, 0, 1] as const;

export const fullScreenStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: colors.background,
  overflowY: 'auto',
  zIndex: 10,
};

export const styles: Record<string, React.CSSProperties> = {
  fullScreen: fullScreenStyle,
};
