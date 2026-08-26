import * as Io5 from 'react-icons/io5';
import type { IconType } from 'react-icons';

// Los nombres de ícono en todo el proyecto son los mismos que usaba la app móvil
// (Ionicons, ej. "restaurant-outline") — react-icons/io5 es el mismo set de
// Ionicons para web, solo con otra convención de nombre: "Io" + PascalCase.
function toIo5Name(name: string): string {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `Io${pascal}`;
}

export function Icon({
  name,
  size = 20,
  color,
  style,
  className,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const Component = (Io5 as unknown as Record<string, IconType>)[toIo5Name(name)] ?? Io5.IoEllipseOutline;
  return <Component size={size} color={color} style={style} className={className} />;
}
