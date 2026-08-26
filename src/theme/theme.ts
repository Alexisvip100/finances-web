// A diferencia de frontend-movile (móvil, sin dark/light switch), aquí cada
// color apunta a una custom property de theme.css en vez de un hex fijo —
// así todo lo que ya usa `colors.x` en un inline style se actualiza solo al
// cambiar de tema, sin tocar los ~30 archivos que lo importan. Los valores
// reales (oscuro/claro) viven en theme.css, no aquí.
export const colors = {
  background: 'var(--color-background)',
  surface: 'var(--color-surface)',
  surfaceAlt: 'var(--color-surface-alt)',
  accent: 'var(--color-accent)',
  accentMuted: 'var(--color-accent-muted)',
  warning: 'var(--color-warning)',
  warningMuted: 'var(--color-warning-muted)',
  danger: 'var(--color-danger)',
  dangerMuted: 'var(--color-danger-muted)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted: 'var(--color-text-muted)',
  divider: 'var(--color-divider)',
  overlay: 'var(--color-overlay)',
  // Fijos a propósito en ambos temas (ej. texto negro sobre el botón accent,
  // que siempre debe leerse bien sin importar el tema activo).
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  input: 16,
  card: 20,
  pill: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  amountSm: 28,
  amountMd: 36,
  amountLg: 48,
};

export const letterSpacing = {
  label: 0.8,
};

// react-icons/io5 usa los mismos nombres que Ionicons (móvil) con "Io5" de prefijo
// en PascalCase — ver components/Icon.tsx para el mapeo nombre-string -> componente.
export const categoryIcons: Record<string, string> = {
  Comida: 'restaurant-outline',
  Gasolina: 'car-outline',
  Entretenimiento: 'film-outline',
  Compras: 'bag-handle-outline',
  Vivienda: 'home-outline',
  Servicios: 'flash-outline',
  Internet: 'wifi-outline',
  Teléfono: 'phone-portrait-outline',
  Suscripciones: 'tv-outline',
  Seguros: 'shield-checkmark-outline',
  Transporte: 'bus-outline',
  Súper: 'cart-outline',
  Renta: 'home-outline',
  Otros: 'file-tray-outline',
};
