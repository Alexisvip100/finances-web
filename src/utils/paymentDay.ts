import { LAST_DAY, PaymentDay } from '../types';

// "Semana de pago": para paydays que no caen en un día fijo del mes sino en
// una semana + día de la semana (ej. "el último viernes del mes" — en un mes
// de 31 días eso puede ser el 28, no el 31, si el 29-31 ya es fin de semana).
// Formato "W{1-4|LAST}-{MON..SUN}", debe espejear WEEK_WEEKDAY_PATTERN del backend.
export const WEEKDAY_CODES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type WeekdayCode = (typeof WEEKDAY_CODES)[number];
export type WeekCode = '1' | '2' | '3' | '4' | 'LAST';
export const WEEK_CODES: WeekCode[] = ['1', '2', '3', '4', 'LAST'];

export const WEEKDAY_LABELS: Record<WeekdayCode, string> = {
  MON: 'Lun', TUE: 'Mar', WED: 'Mié', THU: 'Jue', FRI: 'Vie', SAT: 'Sáb', SUN: 'Dom',
};
export const WEEK_LABELS: Record<WeekCode, string> = {
  '1': '1ª semana', '2': '2ª semana', '3': '3ª semana', '4': '4ª semana', LAST: 'Última semana',
};

const WEEK_WEEKDAY_PATTERN = /^W(1|2|3|4|LAST)-(MON|TUE|WED|THU|FRI|SAT|SUN)$/;

// Día fijo del mes, pero recorrido al viernes anterior si cae sábado/domingo
// (nómina típica: "el 15, o el viernes antes si el 15 cae en fin de semana").
// Formato "D{día}-ADJ", debe espejear DAY_ADJUSTED_PATTERN del backend.
const DAY_ADJUSTED_PATTERN = /^D([1-9]|[12][0-9]|3[01])-ADJ$/;

export function parseWeekWeekday(value: PaymentDay): { week: WeekCode; weekday: WeekdayCode } | null {
  if (typeof value !== 'string') return null;
  const match = WEEK_WEEKDAY_PATTERN.exec(value);
  if (!match) return null;
  return { week: match[1] as WeekCode, weekday: match[2] as WeekdayCode };
}

export function encodeWeekWeekday(week: WeekCode, weekday: WeekdayCode): string {
  return `W${week}-${weekday}`;
}

export function parseDayAdjusted(value: PaymentDay): number | null {
  if (typeof value !== 'string') return null;
  const match = DAY_ADJUSTED_PATTERN.exec(value);
  if (!match) return null;
  return Number(match[1]);
}

export function encodeDayAdjusted(day: number): string {
  return `D${day}-ADJ`;
}

export function paymentDayLabel(value: PaymentDay): string {
  if (value === LAST_DAY) return 'Último día del mes';
  const weekWeekday = parseWeekWeekday(value);
  if (weekWeekday) return `${WEEK_LABELS[weekWeekday.week]}, ${WEEKDAY_LABELS[weekWeekday.weekday]}`;
  const dayAdjusted = parseDayAdjusted(value);
  if (dayAdjusted !== null) return `Día ${dayAdjusted} (o viernes anterior si cae en fin de semana)`;
  return `Día ${value}`;
}

export type PaymentDayState =
  | { mode: 'day'; dayText: string; isLastDay: boolean; adjustWeekend: boolean }
  | { mode: 'week'; week: WeekCode; weekday: WeekdayCode };

export function decodePaymentDayToState(value: PaymentDay | undefined): PaymentDayState {
  if (value === undefined) return { mode: 'day', dayText: '', isLastDay: false, adjustWeekend: false };
  if (value === LAST_DAY) return { mode: 'day', dayText: '', isLastDay: true, adjustWeekend: false };
  const weekWeekday = parseWeekWeekday(value);
  if (weekWeekday) return { mode: 'week', week: weekWeekday.week, weekday: weekWeekday.weekday };
  const dayAdjusted = parseDayAdjusted(value);
  if (dayAdjusted !== null) return { mode: 'day', dayText: String(dayAdjusted), isLastDay: false, adjustWeekend: true };
  return { mode: 'day', dayText: String(value), isLastDay: false, adjustWeekend: false };
}

export function resolvePaymentDayValue(state: PaymentDayState): PaymentDay | null {
  if (state.mode === 'day') {
    if (state.isLastDay) return LAST_DAY;
    if (state.dayText === '') return null;
    const n = Number(state.dayText);
    if (n < 1 || n > 31) return null;
    return state.adjustWeekend ? encodeDayAdjusted(n) : n;
  }
  return encodeWeekWeekday(state.week, state.weekday);
}
