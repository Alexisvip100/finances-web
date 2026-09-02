import React from 'react';
import { styles } from './Pressable.styles';

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
        ...styles.button(rest.disabled, scaleTo),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
