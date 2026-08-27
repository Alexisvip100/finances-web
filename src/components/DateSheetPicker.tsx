import React from 'react';
import { DayPicker } from 'react-day-picker';
import { colors, fontSize, radius, spacing } from '../theme/theme';
import { Pressable } from './Pressable';
import { Portal } from './Portal';
import { toISODate, todayISO } from '../utils/dateHelpers';

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
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: colors.overlay }} />
        <div
          style={{
            position: 'relative',
            background: colors.surfaceAlt,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>Fecha</p>
            <Pressable
              onClick={() => {
                onSelect(todayISO());
                onClose();
              }}
              style={{ background: colors.surface, borderRadius: radius.pill, padding: `${spacing.sm}px ${spacing.md}px` }}
            >
              <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 700 }}>Hoy</span>
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
