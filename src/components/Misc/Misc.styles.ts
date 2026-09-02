import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const TONES: Record<string, { bg: string; text: string }> = {
  neutral: { bg: colors.surfaceAlt, text: colors.textSecondary },
  success: { bg: colors.accentMuted, text: colors.accent },
  warning: { bg: colors.warningMuted, text: colors.warning },
  danger: { bg: colors.dangerMuted, text: colors.danger },
};

export const styles = {
  badge: (tone: 'neutral' | 'success' | 'warning' | 'danger'): React.CSSProperties => {
    const t = TONES[tone];
    return {
      display: 'inline-block',
      padding: `5px ${spacing.md}px`,
      borderRadius: radius.pill,
      background: t.bg,
      color: t.text,
      fontSize: fontSize.xs,
      fontWeight: 700,
    };
  },
  iconCircle: (size: number, bg: string): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  emptyState: {
    border: `1px dashed ${colors.divider}`,
    borderRadius: radius.card,
    padding: spacing.xxl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  } as React.CSSProperties,
  emptyStateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  } as React.CSSProperties,
  emptyStateTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: 700,
    margin: `0 0 ${spacing.sm}px`,
  } as React.CSSProperties,
  emptyStateDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: '19px',
    margin: `0 0 ${spacing.lg}px`,
  } as React.CSSProperties,
  emptyStateActionBtn: {
    paddingLeft: spacing.xxl,
    paddingRight: spacing.xxl,
    minWidth: 200,
    width: 'auto',
  } as React.CSSProperties,
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    background: colors.dangerMuted,
    borderRadius: radius.input,
    padding: spacing.md,
    marginBottom: spacing.lg,
  } as React.CSSProperties,
  errorBannerIcon: {
    marginRight: spacing.sm,
    flexShrink: 0,
  } as React.CSSProperties,
  errorBannerText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    flex: 1,
  } as React.CSSProperties,
  retryBtn: {
    background: 'none',
    border: 'none',
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: 700,
    marginLeft: spacing.sm,
    cursor: 'pointer',
  } as React.CSSProperties,
};
