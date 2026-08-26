import React from 'react';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Icon } from './Icon';
import { PrimaryButton } from './Buttons';

const TONES: Record<string, { bg: string; text: string }> = {
  neutral: { bg: colors.surfaceAlt, text: colors.textSecondary },
  success: { bg: colors.accentMuted, text: colors.accent },
  warning: { bg: colors.warningMuted, text: colors.warning },
  danger: { bg: colors.dangerMuted, text: colors.danger },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: `5px ${spacing.md}px`,
        borderRadius: radius.pill,
        background: t.bg,
        color: t.text,
        fontSize: fontSize.xs,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

export function IconCircle({
  name,
  color = colors.textSecondary,
  bg = colors.surfaceAlt,
  size = 44,
}: {
  name: string;
  color?: string;
  bg?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={size * 0.45} color={color} />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        border: `1px dashed ${colors.divider}`,
        borderRadius: radius.card,
        padding: spacing.xxl,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Icon name={icon} size={26} color={colors.textMuted} />
      </div>
      <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 700, margin: `0 0 ${spacing.sm}px` }}>{title}</p>
      <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: '19px', margin: `0 0 ${spacing.lg}px` }}>
        {description}
      </p>
      {actionLabel ? <PrimaryButton label={actionLabel} onPress={onAction} style={{ paddingLeft: spacing.xxl, paddingRight: spacing.xxl, minWidth: 200, width: 'auto' }} /> : null}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: colors.dangerMuted,
        borderRadius: radius.input,
        padding: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      <Icon name="alert-circle-outline" size={18} color={colors.danger} style={{ marginRight: spacing.sm, flexShrink: 0 }} />
      <span style={{ color: colors.textPrimary, fontSize: fontSize.sm, flex: 1 }}>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'none',
            border: 'none',
            color: colors.danger,
            fontSize: fontSize.sm,
            fontWeight: 700,
            marginLeft: spacing.sm,
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
