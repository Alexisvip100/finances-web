import React from 'react';
import { colors } from '../../../theme/theme';
import { styles } from './ProgressBar.styles';

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
    <div style={styles.track(trackColor, height)}>
      <div style={styles.fill(color, height, clamped)} />
    </div>
  );
}
