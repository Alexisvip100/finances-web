import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/theme';
import { Icon } from '../Icon';
import { Pressable } from '../Pressable';
import { styles } from './TopBar.styles';

export function TopBar({
  title,
  onBack,
  showBack = true,
  right,
}: {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      {showBack ? (
        <Pressable
          onClick={() => (onBack ? onBack() : navigate(-1))}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <div style={styles.backSpacer} />
      )}
      <h1 style={styles.title}>
        {title}
      </h1>
      <div style={styles.rightWrap}>{right}</div>
    </div>
  );
}
