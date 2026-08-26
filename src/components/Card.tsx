import React from 'react';
import { colors, radius, spacing } from '../theme/theme';
import { Pressable } from './Pressable';

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onPress?: () => void;
}

const base: React.CSSProperties = {
  background: colors.surface,
  borderRadius: radius.card,
  padding: spacing.lg,
};

export function Card({ children, style, onPress }: Props) {
  if (onPress) {
    return (
      <Pressable onClick={onPress} scaleTo={0.98} style={{ ...base, display: 'block', width: '100%', textAlign: 'left', ...style }}>
        {children}
      </Pressable>
    );
  }
  return <div style={{ ...base, ...style }}>{children}</div>;
}
