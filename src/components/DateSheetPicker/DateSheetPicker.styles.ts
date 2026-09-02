import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const styles: Record<string, React.CSSProperties> = {
  overlayWrapper: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: colors.overlay,
  },
  sheet: {
    position: 'relative',
    background: colors.surfaceAlt,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: 800,
    margin: 0,
  },
  todayBtn: {
    background: colors.surface,
    borderRadius: radius.pill,
    padding: `${spacing.sm}px ${spacing.md}px`,
  },
  todayLabel: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: 700,
  },
};
