import React from 'react';
import { colors, radius } from '../theme/theme';

export function Skeleton({
  width = '100%',
  height = 16,
  radius: r = 6,
  style,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="skeleton"
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: r,
        ...style,
      }}
    />
  );
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: React.CSSProperties }) {
  return <Skeleton width={size} height={size} radius={size / 2} style={style} />;
}

export function SkeletonRow({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: colors.surface,
        borderRadius: radius.card,
        padding: 16,
        marginBottom: 12,
        gap: 12,
        ...style,
      }}
    >
      <SkeletonCircle size={40} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="35%" height={11} />
      </div>
      <Skeleton width={60} height={16} />
    </div>
  );
}
