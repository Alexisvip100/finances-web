import React from 'react';
import { colors } from '../../theme/theme';
import { Icon } from '../Icon';
import { PrimaryButton } from '../Buttons';
import { styles } from './Misc.styles';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  return (
    <span style={styles.badge(tone)}>
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
    <div style={styles.iconCircle(size, bg)}>
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
    <div style={styles.emptyState}>
      <div style={styles.emptyStateIconWrap}>
        <Icon name={icon} size={26} color={colors.textMuted} />
      </div>
      <p style={styles.emptyStateTitle}>{title}</p>
      <p style={styles.emptyStateDescription}>
        {description}
      </p>
      {actionLabel ? <PrimaryButton label={actionLabel} onPress={onAction} style={styles.emptyStateActionBtn} /> : null}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={styles.errorBanner}>
      <Icon name="alert-circle-outline" size={18} color={colors.danger} style={styles.errorBannerIcon} />
      <span style={styles.errorBannerText}>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          style={styles.retryBtn}
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
