import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radius } from '../theme/theme';
import { Icon } from './Icon';
import { Pressable } from './Pressable';

export function AddExpenseButton() {
  const navigate = useNavigate();
  return (
    <Pressable
      onClick={() => navigate('/gastos/nuevo')}
      scaleTo={0.88}
      style={{
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        background: colors.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name="add" size={20} color={colors.black} />
    </Pressable>
  );
}
