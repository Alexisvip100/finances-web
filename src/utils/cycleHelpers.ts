// Espejo cliente-side de app/services/cycle_service.py (funciones puras).
// Solo se usa para el preview visual en el onboarding ("Lo que gastes hoy lo
// pagas el..."). El backend recalcula todo de verdad al guardar la tarjeta —
// el frontend NUNCA usa este resultado como fuente de verdad (regla del spec §7).

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function addMonths(year: number, month: number, delta: number): [number, number] {
  const zeroBased = month - 1 + delta;
  const newYear = year + Math.floor(zeroBased / 12);
  const newMonth = ((zeroBased % 12) + 12) % 12 + 1;
  return [newYear, newMonth];
}

function resolveStatementDate(year: number, month: number, statementDay: number): Date {
  const day = Math.min(statementDay, lastDayOfMonth(year, month));
  return new Date(year, month - 1, day);
}

export interface CycleBoundsPreview {
  start: Date;
  end: Date;
  due: Date;
}

export function previewCycleBounds(statementDay: number, paymentTermDays: number, referenceDate: Date): CycleBoundsPreview {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;
  const thisMonthStatement = resolveStatementDate(year, month, statementDay);

  let start: Date;
  let end: Date;
  if (referenceDate < thisMonthStatement) {
    const [py, pm] = addMonths(year, month, -1);
    start = resolveStatementDate(py, pm, statementDay);
    end = thisMonthStatement;
  } else {
    start = thisMonthStatement;
    const [ny, nm] = addMonths(year, month, 1);
    end = resolveStatementDate(ny, nm, statementDay);
  }

  const due = new Date(end);
  due.setDate(due.getDate() + paymentTermDays);

  return { start, end, due };
}
