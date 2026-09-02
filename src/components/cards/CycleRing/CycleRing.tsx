import React from 'react';
import { colors } from '../../../theme/theme';
import { styles } from './CycleRing.styles';

export function CycleRing({
  dayIndex,
  totalDays,
  size = 52,
  strokeWidth = 5,
  color = colors.accent,
}: {
  dayIndex: number;
  totalDays: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = totalDays > 0 ? Math.min(1, dayIndex / totalDays) : 0;
  const dashOffset = circumference * (1 - percent);

  return (
    <div style={styles.container(size)}>
      <svg width={size} height={size} style={styles.svg}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.divider} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span style={styles.label}>
        {dayIndex}
        <br />/{totalDays}
      </span>
    </div>
  );
}
