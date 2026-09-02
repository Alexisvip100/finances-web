import React from 'react';
import { Pressable } from '../Pressable';
import { styles } from './Card.styles';

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: Props) {
  if (onPress) {
    return (
      <Pressable onClick={onPress} scaleTo={0.98} style={{ ...styles.pressable, ...style }}>
        {children}
      </Pressable>
    );
  }
  return <div style={{ ...styles.base, ...style }}>{children}</div>;
}
