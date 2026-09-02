import React from 'react';
import { PaymentDayState, WEEKDAY_CODES, WEEKDAY_LABELS, WEEK_CODES, WEEK_LABELS } from '../../utils/paymentDay';
import { styles } from './PaymentDayField.styles';

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
              <span style={styles.checkboxLabel}>Si cae en fin de semana, pagar el viernes anterior</span>
            </button>
          ) : null}
        </>
      ) : (
        <>
          <p style={styles.hint}>¿Qué semana del mes?</p>
          <div style={styles.chipsRow}>
            {WEEK_CODES.map((code) => {
              const active = state.week === code;
              return (
                <button
                  key={code}
                  type="button"
                  style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
                  onClick={() => onChange({ ...state, week: code })}
                >
                  <span style={{ ...styles.chipLabel, ...(active ? styles.chipLabelActive : {}) }}>{WEEK_LABELS[code]}</span>
                </button>
              );
            })}
          </div>

          <p style={styles.hint}>¿Qué día de esa semana?</p>
          <div style={styles.chipsRow}>
            {WEEKDAY_CODES.map((code) => {
              const active = state.weekday === code;
              return (
                <button
                  key={code}
                  type="button"
                  style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
                  onClick={() => onChange({ ...state, weekday: code })}
                >
                  <span style={{ ...styles.chipLabel, ...(active ? styles.chipLabelActive : {}) }}>{WEEKDAY_LABELS[code]}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
