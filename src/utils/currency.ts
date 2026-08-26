export function formatMoney(value: string | number, signed = false): string {
  const num = typeof value === 'string' ? Number(value) : value;
  const sign = signed && num > 0 ? '+' : num < 0 ? '-' : '';
  const abs = Math.abs(Math.round(num));
  return `${sign}$${abs.toLocaleString('es-MX')}`;
}
