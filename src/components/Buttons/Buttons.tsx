import { colors } from '../../theme/theme';
import { Pressable } from '../Pressable';
import { styles } from './Buttons.styles';
import type { BtnProps } from './Button.types';



export function PrimaryButton({ label, onPress, disabled, loading, style }: BtnProps) {
  return (
    <Pressable
      onClick={onPress}
      disabled={disabled || loading}
      style={{ ...styles.primary(disabled), ...style }}
    >
      {loading ? <Spinner color={colors.accentContrast} /> : label}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, style }: BtnProps) {
  return (
    <Pressable
      onClick={onPress}
      disabled={disabled}
      style={{ ...styles.secondary, ...style }}
    >
      {label}
    </Pressable>
  );
}

export function DangerButton({ label, onPress, disabled, style }: BtnProps) {
  return (
    <Pressable onClick={onPress} disabled={disabled} style={{ ...styles.danger, ...style }}>
      {label}
    </Pressable>
  );
}

export function TextLinkButton({ label, onPress, style }: BtnProps) {
  return (
    <Pressable
      onClick={onPress}
      scaleTo={0.97}
      style={{ ...styles.textLink, ...style }}
    >
      {label}
    </Pressable>
  );
}

export function Spinner({ color = colors.accent, size = 16 }: { color?: string; size?: number }) {
  return <span style={styles.spinner(size, color)} />;
}
