import React from 'react';
import { colors, spacing } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    background: colors.background,
  },
  content: {
    height: '100%',
    overflowY: 'auto',
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    maxWidth: 720,
    margin: '0 auto',
  },
};
