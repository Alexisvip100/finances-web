import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  scaleTo?: number;
}

// Equivalente web de AnimatedPressable (móvil): un <button> sin estilos de
// navegador, con la misma retroalimentación de "presionado" vía CSS (ver
// index.css .pressable) en vez de Animated.spring.
export function Pressable({ scaleTo = 0.96, style, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`pressable ${className ?? ''}`}
      style={{
        border: 'none',
        background: 'none',
        padding: 0,
        margin: 0,
        cursor: rest.disabled ? 'default' : 'pointer',
        textAlign: 'inherit',
        ['--press-scale' as string]: scaleTo,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
