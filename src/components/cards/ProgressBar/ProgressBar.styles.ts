import React from 'react';

export const styles = {
  track: (trackColor: string, height: number): React.CSSProperties => ({
    width: '100%',
    overflow: 'hidden',
    background: trackColor,
    height,
    borderRadius: height,
  }),
  fill: (color: string, height: number, clampedPercent: number): React.CSSProperties => ({
    width: `${clampedPercent}%`,
    background: color,
    height,
    borderRadius: height,
    transition: 'width 0.3s ease, background-color 0.18s ease',
  }),
};
