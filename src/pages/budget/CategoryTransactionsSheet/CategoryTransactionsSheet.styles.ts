import React from 'react';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';

export const IOS_EASE = [0.32, 0.72, 0, 1] as const;

export const styles: Record<string, React.CSSProperties> = {
  overlayWrapper: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
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
    maxHeight: '80%',
    overflowY: 'auto',
    maxWidth: 720,
    margin: '0 auto',
    width: '100%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: colors.divider,
    margin: '0 auto',
    marginBottom: spacing.lg,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: 800,
    margin: 0,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    margin: '2px 0 0',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: `${spacing.xl}px 0`,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: `${spacing.xl}px 0`,
  },
  txnRow: {
    display: 'flex',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  txnLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 700,
    margin: 0,
  },
  txnMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    margin: '2px 0 0',
  },
  txnAmount: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: 800,
    marginLeft: spacing.sm,
  },
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    background: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.md,
  },
};
