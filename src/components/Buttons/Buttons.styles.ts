import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const base: React.CSSProperties = {
  borderRadius: radius.pill,
  padding: `${spacing.sm + 2}px ${spacing.xl}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: fontSize.sm,
  fontWeight: 700,
  width: '100%',
};

export const styles = {
  base,
  primary: (disabled?: boolean): React.CSSProperties => ({
    ...base,
    background: colors.accent,
    color: colors.black,
    opacity: disabled ? 0.5 : 1,
  }),
  secondary: {
    ...base,
    background: colors.surface,
    border: `1px solid ${colors.divider}`,
    color: colors.textPrimary,
  } as React.CSSProperties,
  danger: {
    ...base,
    background: colors.dangerMuted,
    color: colors.danger,
  } as React.CSSProperties,
  textLink: {
    padding: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: 600,
  } as React.CSSProperties,
  spinner: (size: number, color: string): React.CSSProperties => ({
    display: 'inline-block',
    width: size,
    height: size,
    border: `2px solid ${colors.divider}`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }),
};
