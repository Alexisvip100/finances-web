import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/theme';
import { Icon } from '../Icon';
import { Pressable } from '../Pressable';
import { styles } from './AddExpenseButton.styles';

export function AddExpenseButton() {
  const navigate = useNavigate();
  return (
    <Pressable
      onClick={() => navigate('/gastos/nuevo')}
      scaleTo={0.88}
      style={styles.button}
    >
      <Icon name="add" size={20} color={colors.accentContrast} />
    </Pressable>
  );
}
