import React from 'react';
import { DayPicker } from 'react-day-picker';
import { Pressable } from '../Pressable';
import { Portal } from '../Portal';
import { toISODate, todayISO } from '../../utils/dateHelpers';
import { styles } from './DateSheetPicker.styles';

export function DateSheetPicker({
  open,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (iso: string) => void;
}) {
  if (!open) return null;
  const selected = value.length === 10 ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Portal>
      <div style={styles.overlayWrapper}>
        <div onClick={onClose} style={styles.backdrop} />
        <div style={styles.sheet}>
          <div style={styles.header}>
            <p style={styles.title}>Fecha</p>
            <Pressable
              onClick={() => {
                onSelect(todayISO());
                onClose();
              }}
              style={styles.todayBtn}
            >
              <span style={styles.todayLabel}>Hoy</span>
            </Pressable>
          </div>
          <DayPicker
            className="ciclos-daypicker"
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return;
              onSelect(toISODate(date));
              onClose();
            }}
            showOutsideDays
          />
        </div>
      </div>
    </Portal>
  );
}
