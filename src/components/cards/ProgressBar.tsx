import React from 'react';
import { colors } from '../../theme/theme';

export function ProgressBar({
  percent,
  color = colors.accent,
  trackColor = colors.divider,
  height = 8,
}: {
  percent: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div style={{ width: '100%', overflow: 'hidden', background: trackColor, height, borderRadius: height }}>
      <div style={{ width: `${clamped}%`, background: color, height, borderRadius: height, transition: 'width 0.3s ease, background-color 0.18s ease' }} />
    </div>
  );
}
