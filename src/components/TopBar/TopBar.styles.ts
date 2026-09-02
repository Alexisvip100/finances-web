import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.input,
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backSpacer: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: 800,
    flex: 1,
    marginLeft: spacing.md,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rightWrap: {
    minWidth: 40,
    display: 'flex',
    justifyContent: 'flex-end',
  },
};
