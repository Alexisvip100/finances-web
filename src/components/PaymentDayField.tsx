import React from 'react';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { PaymentDayState, WEEKDAY_CODES, WEEKDAY_LABELS, WEEK_CODES, WEEK_LABELS } from '../utils/paymentDay';

export function PaymentDayField({
  label,
  state,
  onChange,
}: {
  label: string;
  state: PaymentDayState;
  onChange: (state: PaymentDayState) => void;
}) {
  return (
    <div>
      <p style={styles.label}>{label}</p>
      <div style={styles.modeRow}>
        <button
          type="button"
          style={{ ...styles.modeTab, ...(state.mode === 'day' ? styles.modeTabActive : {}) }}
          onClick={() => onChange({ mode: 'day', dayText: '', isLastDay: false, adjustWeekend: false })}
        >
          <span style={{ ...styles.modeTabLabel, ...(state.mode === 'day' ? styles.modeTabLabelActive : {}) }}>Día exacto</span>
        </button>
        <button
          type="button"
          style={{ ...styles.modeTab, ...(state.mode === 'week' ? styles.modeTabActive : {}) }}
          onClick={() => onChange({ mode: 'week', week: 'LAST', weekday: 'FRI' })}
        >
          <span style={{ ...styles.modeTabLabel, ...(state.mode === 'week' ? styles.modeTabLabelActive : {}) }}>Semana de pago</span>
        </button>
      </div>

      {state.mode === 'day' ? (
        <>
          <input
            value={state.isLastDay ? '' : state.dayText}
            onChange={(e) =>
              onChange({
                mode: 'day',
                dayText: e.target.value.replace(/\D/g, '').slice(0, 2),
                isLastDay: false,
                adjustWeekend: state.adjustWeekend,
              })
            }
            placeholder="Ej. 15"
            inputMode="numeric"
            disabled={state.isLastDay}
            style={{ ...styles.input, ...(state.isLastDay ? styles.inputDisabled : {}) }}
          />
          <button
            type="button"
            style={styles.checkboxRow}
            onClick={() => onChange({ mode: 'day', dayText: '', isLastDay: !state.isLastDay, adjustWeekend: false })}
          >
            <span style={{ ...styles.checkbox, ...(state.isLastDay ? styles.checkboxActive : {}) }} />
            <span style={styles.checkboxLabel}>Usar el último día del mes (útil si el mes tiene 28, 30 o 31 días)</span>
          </button>
          {!state.isLastDay ? (
            <button
              type="button"
              style={styles.checkboxRow}
              onClick={() => onChange({ ...state, adjustWeekend: !state.adjustWeekend })}
            >
              <span style={{ ...styles.checkbox, ...(state.adjustWeekend ? styles.checkboxActive : {}) }} />
              <span style={styles.checkboxLabel}>Ajustar al viernes anterior si cae en fin de semana (ej. nómina)</span>
            </button>
          ) : null}
        </>
      ) : (
        <>
          <p style={styles.hint}>Para paydays que no caen en un día fijo (ej. &quot;el último viernes del mes&quot;)</p>
          <div style={styles.chipsRow}>
            {WEEK_CODES.map((w) => (
              <button
                key={w}
                type="button"
                style={{ ...styles.chip, ...(state.week === w ? styles.chipActive : {}) }}
                onClick={() => onChange({ ...state, week: w })}
              >
                <span style={{ ...styles.chipLabel, ...(state.week === w ? styles.chipLabelActive : {}) }}>{WEEK_LABELS[w]}</span>
              </button>
            ))}
          </div>
          <div style={styles.chipsRow}>
            {WEEKDAY_CODES.map((d) => (
              <button
                key={d}
                type="button"
                style={{ ...styles.chip, ...(state.weekday === d ? styles.chipActive : {}) }}
                onClick={() => onChange({ ...state, weekday: d })}
              >
                <span style={{ ...styles.chipLabel, ...(state.weekday === d ? styles.chipLabelActive : {}) }}>{WEEKDAY_LABELS[d]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600, marginBottom: spacing.sm, marginTop: spacing.lg },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.sm },
  modeRow: { display: 'flex', flexDirection: 'row', background: colors.surface, borderRadius: radius.pill, padding: 4, marginBottom: spacing.md },
  modeTab: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  modeTabActive: { background: colors.accent },
  modeTabLabel: { color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.xs },
  modeTabLabelActive: { color: colors.black },
  input: {
    width: '100%',
    background: colors.surface,
    borderRadius: radius.input,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    border: 'none',
  },
  inputDisabled: { opacity: 0.4 },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
    border: 'none',
    background: 'none',
    padding: 0,
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
  },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: `2px solid ${colors.divider}`, flexShrink: 0, boxSizing: 'border-box' },
  checkboxActive: { background: colors.accent, borderColor: colors.accent },
  checkboxLabel: { color: colors.textSecondary, fontSize: fontSize.xs, flex: 1, lineHeight: '16px' },
  chipsRow: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: radius.pill,
    background: colors.surface,
    border: 'none',
    cursor: 'pointer',
  },
  chipActive: { background: colors.accentMuted, border: `1px solid ${colors.accent}` },
  chipLabel: { color: colors.textSecondary, fontWeight: 600, fontSize: fontSize.sm },
  chipLabelActive: { color: colors.accent },
};
