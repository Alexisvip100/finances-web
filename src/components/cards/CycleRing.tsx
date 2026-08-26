import React from 'react';
import { colors, fontSize } from '../../theme/theme';

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
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
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
      <span style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
        {dayIndex}
        <br />/{totalDays}
      </span>
    </div>
  );
}
