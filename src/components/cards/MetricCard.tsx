import React from 'react';
import { colors, fontSize, letterSpacing, radius, spacing } from '../../theme/theme';

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
    <div style={{ background: colors.surface, borderRadius: radius.card, padding: spacing.lg, flex: 1, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <span
          style={{
            color: colors.textSecondary,
            fontSize: fontSize.xs,
            fontWeight: 700,
            letterSpacing: letterSpacing.label,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        {trailing}
      </div>
      <div style={{ color: valueColor, fontWeight: 800, fontSize: fontSize[amountSize] }}>{value}</div>
    </div>
  );
}

export function MiniStat({ label, value, color = colors.textPrimary }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1 }}>
      <span
        style={{
          display: 'block',
          color: colors.textSecondary,
          fontSize: fontSize.xs,
          fontWeight: 700,
          letterSpacing: letterSpacing.label,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span style={{ display: 'block', fontSize: fontSize.lg, fontWeight: 800, marginTop: 2, color }}>{value}</span>
    </div>
  );
}
