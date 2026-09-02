import React from 'react';
import { colors, fontSize, radius, spacing } from '../../theme/theme';

export const IOS_EASE = [0.32, 0.72, 0, 1] as const;

export const styles: Record<string, React.CSSProperties> = {
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 3100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: colors.overlay,
  },
  modalCard: {
    position: 'relative',
    width: '100%',
    maxWidth: 300,
    background: colors.surfaceAlt,
    borderRadius: radius.card,
    padding: spacing.xl,
    textAlign: 'center',
    boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
  },
  iconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: 800,
    margin: 0,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    margin: `${spacing.sm}px 0 0`,
  },
  btnStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  updateBtn: {
    background: colors.accent,
    color: colors.black,
    borderRadius: radius.pill,
    padding: `${spacing.md}px 0`,
    fontSize: fontSize.md,
    fontWeight: 800,
  },
  laterBtn: {
    background: 'transparent',
    color: colors.textSecondary,
    padding: `${spacing.sm}px 0`,
    fontSize: fontSize.md,
    fontWeight: 700,
  },
};
