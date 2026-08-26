// Mismos valores que frontend-movile/src/theme/theme.ts (fuente de verdad) —
// espejeados aquí para la lógica en TS; el CSS usa las custom properties de theme.css.
export const colors = {
  background: '#0E0F13',
  surface: '#191B21',
  surfaceAlt: '#2A2D35',
  accent: '#C6F24E',
  accentMuted: 'rgba(198, 242, 78, 0.14)',
  warning: '#F2B84E',
  warningMuted: 'rgba(242, 184, 78, 0.14)',
  danger: '#F2565B',
  dangerMuted: 'rgba(242, 86, 91, 0.14)',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8F9A',
  textMuted: '#5C606B',
  divider: '#262931',
  overlay: 'rgba(6, 7, 9, 0.75)',
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
