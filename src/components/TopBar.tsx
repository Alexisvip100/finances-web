import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Icon } from './Icon';
import { Pressable } from './Pressable';

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
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.lg }}>
      {showBack ? (
        <Pressable
          onClick={() => (onBack ? onBack() : navigate(-1))}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.input,
            background: colors.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <div style={{ width: 40, height: 40, flexShrink: 0 }} />
      )}
      <h1
        style={{
          color: colors.textPrimary,
          fontSize: fontSize.xl,
          fontWeight: 800,
          flex: 1,
          marginLeft: spacing.md,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </h1>
      <div style={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}
