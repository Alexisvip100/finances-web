import React from 'react';
import { styles } from './TextField.styles';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  type,
  style,
  inputStyle,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  type?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  autoFocus?: boolean;
}) {
  return (
    <div style={{ ...styles.container, ...style }}>
      {label ? <label style={styles.label}>{label}</label> : null}
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        type={secure ? 'password' : type ?? 'text'}
        autoFocus={autoFocus}
        style={{
          ...styles.input,
          ...inputStyle,
        }}
      />
    </div>
  );
}
