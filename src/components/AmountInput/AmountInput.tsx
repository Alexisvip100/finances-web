import React from 'react';
import { styles } from './AmountInput.styles';

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
    <div style={styles.container}>
      <span style={styles.dollar(size)}>$</span>
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value.replace(/[^0-9.]/g, ''))}
        inputMode="decimal"
        placeholder="0.00"
        autoFocus={autoFocus}
        style={styles.input(size)}
        size={Math.max(4, value.length || 4)}
      />
    </div>
  );
}
