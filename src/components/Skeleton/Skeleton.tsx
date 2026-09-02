import React from 'react';
import { styles } from './Skeleton.styles';

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
        ...styles.skeleton(width, height, r),
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
        ...styles.rowContainer,
        ...style,
      }}
    >
      <SkeletonCircle size={40} />
      <div style={styles.rowTextWrap}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="35%" height={11} />
      </div>
      <Skeleton width={60} height={16} />
    </div>
  );
}
