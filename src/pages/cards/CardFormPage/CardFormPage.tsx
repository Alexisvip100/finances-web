import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton } from '../../../components/Buttons';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { ErrorBanner } from '../../../components/Misc';
import { colors, fontSize, spacing } from '../../../theme/theme';
import { formatShort, maskDateInput, toISODate } from '../../../utils/dateHelpers';
import {
  CARD_COLORS,
  dynamicStyles,
  hintStyle,
  inputStyle,
  labelStyle,
  styles,
  twoColStyle,
} from './CardFormPage.styles';
import { useCardFormPage } from './CardFormPage.hooks';

export default function CardFormPage() {
  const {
    navigate,
    isEdit,
    kind,
    name,
    bank,
    lastFour,
    creditLimit,
    statementDay,
    paymentTermDays,
    color,
    hasExistingDebt,
    initialBalance,
    initialDueDate,
    debitBalance,
    saving,
    cardsError,
    accountsError,
    preview,
    canSave,
    setKind,
    setName,
    setBank,
    setLastFour,
    setCreditLimit,
    setStatementDay,
    setPaymentTermDays,
    setColor,
    setHasExistingDebt,
    setInitialBalance,
    setInitialDueDate,
    setDebitBalance,
    handleSave,
  } = useCardFormPage();

  return (
    <PageShell>
      <TopBar
        title={isEdit ? 'Editar tarjeta' : kind === 'CREDIT' ? 'Nueva tarjeta de crédito' : 'Nueva tarjeta de débito'}
        onBack={() => navigate(-1)}
      />

      {!isEdit ? (
        <div style={styles.modeTabs}>
          <Pressable
            onClick={() => setKind('DEBIT')}
            style={dynamicStyles.modeTab(kind === 'DEBIT')}
          >
            <span style={dynamicStyles.modeText(kind === 'DEBIT')}>Débito</span>
          </Pressable>
          <Pressable
            onClick={() => setKind('CREDIT')}
            style={dynamicStyles.modeTab(kind === 'CREDIT')}
          >
            <span style={dynamicStyles.modeText(kind === 'CREDIT')}>Crédito</span>
          </Pressable>
        </div>
      ) : null}

      {cardsError ? <ErrorBanner message={cardsError} /> : null}
      {accountsError ? <ErrorBanner message={accountsError} /> : null}

      <p style={labelStyle}>Nombre</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === 'CREDIT' ? 'Ej. Amex Platino' : 'Ej. Débito BBVA'} style={inputStyle} />

      <p style={labelStyle}>Banco</p>
      <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Ej. BBVA, Nu, Amex" style={inputStyle} />

      {kind === 'DEBIT' && !isEdit ? (
        <>
          <p style={labelStyle}>Dinero que tienes ahí</p>
          <input
            value={debitBalance}
            onChange={(e) => setDebitBalance(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            inputMode="decimal"
            style={inputStyle}
          />
        </>
      ) : (
        <>
          <div style={twoColStyle}>
            <div style={{ flex: 1 }}>
              <p style={labelStyle}>Últimos 4</p>
              <p style={hintStyle}>Para identificarla, no hace falta el número completo</p>
              <input
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                inputMode="numeric"
                disabled={isEdit}
                style={{ ...inputStyle, opacity: isEdit ? 0.6 : 1 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={labelStyle}>Límite de crédito</p>
              <p style={hintStyle}>El límite que te dio el banco</p>
              <input
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                inputMode="decimal"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={twoColStyle}>
            <div style={{ flex: 1 }}>
              <p style={labelStyle}>Día de corte</p>
              <p style={hintStyle}>El día del mes en que tu banco cierra el periodo</p>
              <input
                value={statementDay}
                onChange={(e) => setStatementDay(e.target.value.replace(/\D/g, ''))}
                placeholder="15"
                inputMode="numeric"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={labelStyle}>Plazo (días)</p>
              <p style={hintStyle}>Días entre el corte y la fecha límite de pago</p>
              <input
                value={paymentTermDays}
                onChange={(e) => setPaymentTermDays(e.target.value.replace(/\D/g, ''))}
                placeholder="20"
                inputMode="numeric"
                style={inputStyle}
              />
            </div>
          </div>

          {preview ? (
            <div style={styles.previewBanner}>
              <Icon name="flash" size={16} color={colors.accent} style={{ marginRight: spacing.sm, flexShrink: 0 }} />
              <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1, lineHeight: '19px', margin: 0 }}>
                Lo que gastes hoy lo pagas el <span style={{ color: colors.textPrimary, fontWeight: 800 }}>{formatShort(toISODate(preview.due))}</span>.
              </p>
            </div>
          ) : null}
        </>
      )}

      <p style={labelStyle}>Color</p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md }}>
        {CARD_COLORS.map((c) => (
          <Pressable
            key={c}
            onClick={() => setColor(c)}
            style={dynamicStyles.colorDot(c, color === c)}
          />
        ))}
      </div>

      {kind === 'CREDIT' && !isEdit ? (
        <>
          <div style={styles.debtSwitchRow}>
            <div style={{ flex: 1 }}>
              <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>Ya tengo saldo pendiente</p>
              <p style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, marginBottom: 0 }}>Captura un ciclo cerrado inicial con la deuda que ya traes</p>
            </div>
            <Pressable
              onClick={() => setHasExistingDebt((v) => !v)}
              style={dynamicStyles.debtSwitchTrack(hasExistingDebt)}
            >
              <span
                style={dynamicStyles.debtSwitchThumb(hasExistingDebt)}
              />
            </Pressable>
          </div>

          {hasExistingDebt ? (
            <div style={twoColStyle}>
              <div style={{ flex: 1 }}>
                <p style={labelStyle}>Saldo pendiente</p>
                <input
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  inputMode="decimal"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={labelStyle}>Vence (YYYY-MM-DD)</p>
                <input
                  value={initialDueDate}
                  onChange={(e) => setInitialDueDate(maskDateInput(e.target.value))}
                  placeholder="2026-09-14"
                  inputMode="numeric"
                  maxLength={10}
                  style={inputStyle}
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <PrimaryButton
        label={isEdit ? 'Guardar cambios' : kind === 'CREDIT' ? 'Guardar tarjeta' : 'Guardar tarjeta de débito'}
        onPress={handleSave}
        disabled={!canSave}
        loading={saving}
        style={{ marginTop: spacing.xl }}
      />
    </PageShell>
  );
}
