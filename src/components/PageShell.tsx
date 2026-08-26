import React from 'react';
import { colors, spacing } from '../theme/theme';

// Equivalente de ScreenContainer (móvil): contenedor con padding + scroll propio,
// más un slot "floating" para el FAB. No incluye pull-to-refresh (no aplica en web).
export function PageShell({
  children,
  style,
  contentStyle,
  floating,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  floating?: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: colors.background, ...style }}>
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          padding: spacing.lg,
          paddingBottom: spacing.xxxl * 2,
          maxWidth: 720,
          margin: '0 auto',
          ...contentStyle,
        }}
      >
        {children}
      </div>
      {floating}
    </div>
  );
}
