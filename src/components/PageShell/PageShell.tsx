import React from 'react';
import { styles } from './PageShell.styles';

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
    <div style={{ ...styles.container, ...style }}>
      <div
        style={{
          ...styles.content,
          ...contentStyle,
        }}
      >
        {children}
      </div>
      {floating}
    </div>
  );
}
