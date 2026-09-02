import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import type { ToastItem } from '../types';

export const IOS_EASE = [0.32, 0.72, 0, 1] as const;
export const UPDATE_AUTO_DISMISS_MS = 7000;
export const SUCCESS_AUTO_DISMISS_MS = 2200;

export const TOAST_META: Record<ToastItem['kind'], { title: string; icon: string; bg: string; color: string }> = {
  error: { title: 'No se pudo completar', icon: 'cloud-offline-outline', bg: colors.dangerMuted, color: colors.danger },
  update: { title: 'Actualización disponible', icon: 'sparkles-outline', bg: colors.accentMuted, color: colors.accent },
  success: { title: 'Listo', icon: 'checkmark-circle', bg: colors.accentMuted, color: colors.accent },
};

export const styles = {
  stackContainer: {
    position: 'fixed',
    top: 'max(env(safe-area-inset-top), 12px)',
    left: 0,
    right: 0,
    zIndex: 3000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `0 ${spacing.lg}px`,
    pointerEvents: 'none',
  } as React.CSSProperties,
  banner: {
    pointerEvents: 'auto',
    width: '100%',
    maxWidth: 420,
    background: colors.surfaceAlt,
    borderRadius: radius.card,
    padding: spacing.lg,
    boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
    cursor: 'grab',
  } as React.CSSProperties,
  contentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.md,
  } as React.CSSProperties,
  textWrap: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 800,
    margin: 0,
  } as React.CSSProperties,
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    margin: '2px 0 0',
  } as React.CSSProperties,
  closeBtn: {
    padding: spacing.xs,
    flexShrink: 0,
  } as React.CSSProperties,
  actionsRow: {
    display: 'flex',
    gap: spacing.sm,
    marginTop: spacing.md,
  } as React.CSSProperties,
  updateBtn: {
    flex: 1,
    background: colors.accent,
    color: colors.black,
    borderRadius: radius.pill,
    padding: `${spacing.sm}px 0`,
    fontSize: fontSize.sm,
    fontWeight: 800,
    textAlign: 'center',
  } as React.CSSProperties,
  retryBtn: (retrying: boolean): React.CSSProperties => ({
    flex: 1,
    background: colors.accent,
    color: colors.black,
    borderRadius: radius.pill,
    padding: `${spacing.sm}px 0`,
    fontSize: fontSize.sm,
    fontWeight: 800,
    textAlign: 'center',
    opacity: retrying ? 0.7 : 1,
  }),
  dismissBtn: {
    flex: 1,
    background: colors.surface,
    color: colors.textSecondary,
    borderRadius: radius.pill,
    padding: `${spacing.sm}px 0`,
    fontSize: fontSize.sm,
    fontWeight: 700,
    textAlign: 'center',
  } as React.CSSProperties,
};
