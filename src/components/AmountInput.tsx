import React from 'react';
import { colors, fontSize, spacing } from '../theme/theme';

export function AmountInput({
  value,
  onChangeText,
  autoFocus,
  size = 'amountMd',
}: {
  value: string;
  onChangeText: (v: string) => void;
  autoFocus?: boolean;
  size?: 'amountSm' | 'amountMd' | 'amountLg';
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: colors.textPrimary, fontWeight: 800, marginRight: spacing.xs, fontSize: fontSize[size] }}>$</span>
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value.replace(/[^0-9.]/g, ''))}
        inputMode="decimal"
        placeholder="0.00"
        autoFocus={autoFocus}
        style={{
          color: colors.textPrimary,
          fontWeight: 800,
          padding: 0,
          minWidth: 40,
          fontSize: fontSize[size],
          textAlign: 'center',
        }}
        size={Math.max(4, value.length || 4)}
      />
    </div>
  );
}
