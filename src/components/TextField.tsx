import React from 'react';
import { colors, fontSize, radius, spacing } from '../theme/theme';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  type,
  style,
  inputStyle,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  type?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  autoFocus?: boolean;
}) {
  return (
    <div style={{ marginBottom: spacing.lg, ...style }}>
      {label ? <label style={{ display: 'block', color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.sm }}>{label}</label> : null}
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        type={secure ? 'password' : type ?? 'text'}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          background: colors.surface,
          borderRadius: radius.input,
          padding: spacing.lg,
          color: colors.textPrimary,
          fontSize: fontSize.md,
          ...inputStyle,
        }}
      />
    </div>
  );
}
