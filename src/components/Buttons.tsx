import React from 'react';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Pressable } from './Pressable';

interface BtnProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}

const base: React.CSSProperties = {
  borderRadius: radius.pill,
  padding: `${spacing.sm + 2}px ${spacing.xl}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: fontSize.sm,
  fontWeight: 700,
  width: '100%',
};

export function PrimaryButton({ label, onPress, disabled, loading, style }: BtnProps) {
  return (
    <Pressable
      onClick={onPress}
      disabled={disabled || loading}
      style={{ ...base, background: colors.accent, color: colors.black, opacity: disabled ? 0.5 : 1, ...style }}
    >
      {loading ? <Spinner color={colors.black} /> : label}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, style }: BtnProps) {
  return (
    <Pressable
      onClick={onPress}
      disabled={disabled}
      style={{ ...base, background: colors.surface, border: `1px solid ${colors.divider}`, color: colors.textPrimary, ...style }}
    >
      {label}
    </Pressable>
  );
}

export function DangerButton({ label, onPress, disabled, style }: BtnProps) {
  return (
    <Pressable onClick={onPress} disabled={disabled} style={{ ...base, background: colors.dangerMuted, color: colors.danger, ...style }}>
      {label}
    </Pressable>
  );
}

export function TextLinkButton({ label, onPress, style }: BtnProps) {
  return (
    <Pressable
      onClick={onPress}
      scaleTo={0.97}
      style={{ padding: spacing.sm, color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, ...style }}
    >
      {label}
    </Pressable>
  );
}

export function Spinner({ color = colors.accent, size = 16 }: { color?: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${color}33`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}
