import React from 'react';

export const basePressable: React.CSSProperties = {
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  textAlign: 'inherit',
};

export const styles = {
  button: (disabled?: boolean, scaleTo: number = 0.96): React.CSSProperties => ({
    ...basePressable,
    cursor: disabled ? 'default' : 'pointer',
    ['--press-scale' as string]: scaleTo,
  }),
};
