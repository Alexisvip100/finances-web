import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { Icon } from '../../../components/Icon';
import { Pressable } from '../../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createCardThunk } from '../../../store/slices/cardsSlice';
import { previewCycleBounds } from '../../../utils/cycleHelpers';
import { formatShort } from '../../../utils/dateHelpers';
import { CARD_COLORS, dynamicStyles, styles } from './FirstCardPage.styles';

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function FirstCardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.cards);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [statementDay, setStatementDay] = useState('15');
  const [paymentTermDays, setPaymentTermDays] = useState('20');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    const sd = Number(statementDay);
    const term = Number(paymentTermDays);
    if (!sd || !term) return null;
    return previewCycleBounds(sd, term, new Date());
  }, [statementDay, paymentTermDays]);

  const canSave = name.trim() && bank.trim() && lastFour.length === 4 && Number(statementDay) >= 1 && Number(statementDay) <= 31;

  const handleNext = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await dispatch(
        createCardThunk({
          name: name.trim(),
          bank: bank.trim(),
          last_four: lastFour,
          credit_limit: creditLimit || '0',
          statement_day: Number(statementDay),
          payment_term_days: Number(paymentTermDays),
          color,
        })
      ).unwrap();
      navigate('/onboarding/ingreso');
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell contentStyle={styles.content}>
      <div style={{ flex: 1 }}>
        <div style={styles.progressRow}>
          <Pressable onClick={() => navigate(-1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-back" size={18} color={colors.accent} />
          </Pressable>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
          <TextLinkButton label="Saltar" onPress={() => navigate('/onboarding/ingreso')} style={styles.skipBtn} />
        </div>

        <h1 style={styles.title}>
          Agrega tu primera tarjeta de crédito.
        </h1>
        <div style={{ display: 'flex', background: colors.surface, borderRadius: radius.input, padding: spacing.md, marginBottom: spacing.xl }}>
          <Icon name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginRight: spacing.sm, flexShrink: 0 }} />
          <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, flex: 1, lineHeight: '17px' }}>
            ¿No usas tarjeta de crédito? Toca "Saltar" — tus cuentas de débito y efectivo ya quedaron guardadas en el paso anterior.
          </span>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <label style={styles.label}>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Tarjeta de Gastos" style={styles.input} />

        <label style={styles.label}>Banco</label>
        <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Ej. BBVA, Nu, Amex" style={styles.input} />

        <div style={styles.twoCol}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Últimos 4</label>
            <span style={styles.hint}>Para identificarla</span>
            <input
              value={lastFour}
              onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              inputMode="numeric"
              style={styles.input}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Límite de crédito</label>
            <span style={styles.hint}>El que te dio el banco</span>
            <div style={{ background: colors.surface, borderRadius: radius.input, padding: spacing.lg, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800, marginRight: 4 }}>$</span>
              <input
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                inputMode="decimal"
                style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, padding: 0, background: 'none', border: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: spacing.xl }}>
          <Icon name="sync-outline" size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <span style={{ color: colors.accent, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Reglas del ciclo
          </span>
        </div>
        <div style={styles.twoCol}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Día de corte</label>
            <span style={styles.hint}>Cuándo cierra el periodo</span>
            <input
              value={statementDay}
              onChange={(e) => setStatementDay(e.target.value.replace(/\D/g, ''))}
              placeholder="15"
              inputMode="numeric"
              style={styles.input}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Plazo (días)</label>
            <span style={styles.hint}>Días para pagar tras el corte</span>
            <input
              value={paymentTermDays}
              onChange={(e) => setPaymentTermDays(e.target.value.replace(/\D/g, ''))}
              placeholder="20"
              inputMode="numeric"
              style={styles.input}
            />
          </div>
        </div>

        {preview ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', background: colors.accentMuted, borderRadius: radius.input, padding: spacing.lg, marginTop: spacing.lg }}>
            <Icon name="flash" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
            <span style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1, lineHeight: '19px' }}>
              Tu ciclo actual:{' '}
              <span style={{ color: colors.textPrimary, fontWeight: 800 }}>
                {formatShort(toISO(preview.start))} – {formatShort(toISO(preview.end))}
              </span>
              .
              <br />
              Lo que gastes hoy lo pagas el{' '}
              <span style={{ color: colors.textPrimary, fontWeight: 800 }}>{formatShort(toISO(preview.due))}</span>.
            </span>
          </div>
        ) : null}

        <label style={styles.label}>Color de tarjeta</label>
        <div style={styles.colorsRow}>
          {CARD_COLORS.map((c) => (
            <Pressable
              key={c}
              onClick={() => setColor(c)}
              style={dynamicStyles.colorDot(c, color === c)}
            />
          ))}
        </div>
      </div>

      <PrimaryButton label="Siguiente" onPress={handleNext} disabled={!canSave} loading={saving} style={{ marginTop: spacing.xl }} />
    </PageShell>
  );
}
