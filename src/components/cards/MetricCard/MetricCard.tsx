import React from 'react';
import { colors } from '../../../theme/theme';
import { styles } from './MetricCard.styles';

export function MetricCard({
  label,
  value,
  valueColor = colors.textPrimary,
  amountSize = 'amountSm',
  trailing,
  style,
}: {
  label: string;
  value: string;
  valueColor?: string;
  amountSize?: 'amountSm' | 'amountMd' | 'amountLg';
  trailing?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...styles.card, ...style }}>
      <div style={styles.header}>
        <span style={styles.label}>
          {label}
        </span>
        {trailing}
      </div>
      <div style={styles.value(valueColor, amountSize)}>{value}</div>
    </div>
  );
}

export function MiniStat({ label, value, color = colors.textPrimary }: { label: string; value: string; color?: string }) {
  return (
    <div style={styles.miniStatContainer}>
      <span style={styles.miniStatLabel}>
        {label}
      </span>
      <span style={styles.miniStatValue(color)}>{value}</span>
    </div>
  );
}
