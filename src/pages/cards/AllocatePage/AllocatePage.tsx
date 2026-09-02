import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { CycleRing } from '../../../components/cards/CycleRing';
import { ErrorBanner } from '../../../components/Misc';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { colors, fontSize } from '../../../theme/theme';
import { formatMoney } from '../../../utils/currency';
import { formatShort } from '../../../utils/dateHelpers';
import { accountLabel } from '../../../utils/labels';
import { dynamicStyles, styles } from './AllocatePage.styles';
import { useAllocatePage } from './AllocatePage.hooks';

export default function AllocatePage() {
  const {
    navigate,
    accounts,
    detail,
    cardsError,
    amount,
    accountId,
    error,
    saving,
    pendingCycle,
    remaining,
    alreadyAllocated,
    missing,
    percent,
    nextIncomeBeforeDue,
    canSave,
    setAmount,
    setAccountId,
    handleAllocate,
    handleWithdraw,
  } = useAllocatePage();

  if (!detail || !pendingCycle) {
    return (
      <PageShell>
        <TopBar title="Apartar" onBack={() => navigate(-1)} />
        {cardsError ? <ErrorBanner message={cardsError} /> : null}
      </PageShell>
    );
  }

  return (
    <PageShell contentStyle={styles.pageContent}>
      <TopBar title="Apartar dinero" onBack={() => navigate(-1)} />

      <div style={styles.card}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <span style={styles.sectionLabel}>APARTADO PARA ESTA TARJETA</span>
            <p style={styles.amountLarge}>{formatMoney(alreadyAllocated)}</p>
            <p style={styles.amountSub}>de {formatMoney(remaining)} que vencen el {formatShort(pendingCycle.due_date)}</p>
          </div>
          <CycleRing dayIndex={percent} totalDays={100} size={76} strokeWidth={7} />
        </div>
      </div>

      {missing > 0 ? (
        <p style={{ color: colors.warning, fontSize: fontSize.sm, fontWeight: 700, margin: '12px 0' }}>
          Faltan {formatMoney(missing)} para cubrir el pago completo
        </p>
      ) : (
        <p style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: 700, margin: '12px 0' }}>
          Ya tienes apartado el total de esta tarjeta
        </p>
      )}

      {nextIncomeBeforeDue ? (
        <div style={styles.nextIncomeCard}>
          <Icon name="calendar-outline" size={16} color={colors.accent} style={{ marginRight: 8, flexShrink: 0 }} />
          <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, margin: 0, lineHeight: '18px' }}>
            Tu próximo ingreso cae el <span style={{ color: colors.textPrimary, fontWeight: 700 }}>{formatShort(nextIncomeBeforeDue)}</span>, antes de que venza esta tarjeta ({formatShort(pendingCycle.due_date)}).
          </p>
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      <span style={{ ...styles.sectionLabel, marginTop: 16 }}>¿CUÁNTO QUIERES APARTAR?</span>
      <div style={styles.amountInputRow}>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, marginRight: 6 }}>$</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder={missing > 0 ? String(missing) : '0.00'}
          inputMode="decimal"
          style={styles.inputField}
        />
      </div>

      <span style={{ ...styles.sectionLabel, marginTop: 20 }}>¿DE QUÉ CUENTA SALE?</span>
      <div style={styles.accountsRow}>
        {accounts.map((a) => {
          const selected = accountId === a.id;
          return (
            <Pressable
              key={a.id}
              onClick={() => setAccountId(a.id)}
              style={dynamicStyles.accountChip(selected)}
            >
              <span style={dynamicStyles.accountChipText(selected)}>
                {accountLabel(a)} ({formatMoney(a.balance)})
              </span>
            </Pressable>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <PrimaryButton
        label={percent >= 100 ? 'Apartar más' : 'Apartar'}
        onPress={handleAllocate}
        disabled={!canSave}
        loading={saving}
        style={{ marginTop: 24 }}
      />

      {alreadyAllocated > 0 ? (
        <TextLinkButton
          label="Desapartar dinero"
          onPress={handleWithdraw}
          style={{ marginTop: 8 }}
        />
      ) : null}
    </PageShell>
  );
}
