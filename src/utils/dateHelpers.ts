// Todas las fechas que manda el backend son "YYYY-MM-DD" (fecha calendario,
// sin hora). Hay que parsearlas como fecha LOCAL (año, mes, día) y nunca con
// `new Date(str)` directo: eso lo interpreta como medianoche UTC, y en México
// (UTC-6) se corre un día hacia atrás al mostrarlo.

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MONTHS_ES_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function lastDayOfMonth(year: number, month: number): number {
  // month es 1-12
  return new Date(year, month, 0).getDate();
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** "25 ago" */
export function formatShort(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS_ES_SHORT[d.getMonth()]}`;
}

/** "25 de agosto de 2026" */
export function formatLong(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "Viernes 4 sep" */
export function formatWeekdayShort(iso: string): string {
  const d = parseISODate(iso);
  const weekday = WEEKDAYS_ES[d.getDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${d.getDate()} ${MONTHS_ES_SHORT[d.getMonth()]}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = startOfDay(parseISODate(fromISO));
  const to = startOfDay(parseISODate(toISO));
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** "Hoy" | "Ayer" | "en 3 días" | "hace 2 días" — relativo a hoy. */
export function formatRelativeToToday(iso: string): string {
  const diff = daysBetween(todayISO(), iso);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff > 1) return `en ${diff} días`;
  return `hace ${Math.abs(diff)} días`;
}

export function weekLabel(weekIndex: number): string {
  if (weekIndex === 0) return 'Esta semana';
  if (weekIndex === 1) return 'Próxima semana';
  return `Semana ${weekIndex + 1}`;
}

/** "4 - 10 Sep" */
export function formatRangeShort(startISO: string, endISO: string): string {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const endLabel = `${end.getDate()} ${MONTHS_ES_SHORT[end.getMonth()].charAt(0).toUpperCase()}${MONTHS_ES_SHORT[end.getMonth()].slice(1)}`;
  return `${start.getDate()} - ${endLabel}`;
}

export function monthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const name = MONTHS_ES[month - 1] ?? '';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** Mientras el usuario escribe solo dígitos, inserta los "-" de YYYY-MM-DD por él. */
export function maskDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  return [year, month, day].filter(Boolean).join('-');
}

export function shiftDate(iso: string, deltaDays: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + deltaDays);
  return toISODate(d);
}

/** Lunes de la semana que contiene `iso`. */
export function startOfWeek(iso: string): string {
  const d = parseISODate(iso);
  const day = d.getDay(); // 0 = domingo .. 6 = sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toISODate(d);
}

/** Domingo de la semana que contiene `iso`. */
export function endOfWeek(iso: string): string {
  return shiftDate(startOfWeek(iso), 6);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const zeroBased = (month - 1) + delta;
  const newYear = year + Math.floor(zeroBased / 12);
  const newMonth = ((zeroBased % 12) + 12) % 12 + 1;
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}
