import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, TextLinkButton } from '../../../components/Buttons';
import { CycleRing } from '../../../components/cards/CycleRing';
import { ErrorBanner } from '../../../components/Misc';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { colors, fontSize } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardDetailThunk } from '../../../store/slices/cardsSlice';
import { fetchDashboardThunk } from '../../../store/slices/dashboardSlice';
import { extractErrorMessage } from '../../../api/client';
import * as paymentsApi from '../../../api/payments';
import { formatMoney } from '../../../utils/currency';
import { formatShort } from '../../../utils/dateHelpers';
import { accountLabel } from '../../../utils/labels';
import { dynamicStyles, styles } from './AllocatePage.styles';

export default function AllocatePage() {
  const navigate = useNavigate();
  const { cardId: cardIdParam } = useParams();
  const cardId = Number(cardIdParam);
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const detail = useAppSelector((s) => s.cards.detailById[cardId]);
  const dashboard = useAppSelector((s) => s.dashboard.data);
  const cardsError = useAppSelector((s) => s.cards.error);

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCardDetailThunk(cardId));
    dispatch(fetchAccountsThunk());
    dispatch(fetchDashboardThunk());
  }, [cardId, dispatch]);

  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accountId, accounts]);

  const pendingCycle = detail?.pending_cycle;
  const cycleId = pendingCycle?.id ?? null;
  const remaining = pendingCycle ? Number(pendingCycle.total_amount) - Number(pendingCycle.paid_amount) : 0;
  const alreadyAllocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;
  const missing = Math.max(0, remaining - alreadyAllocated);
  const percent = remaining > 0 ? Math.min(100, Math.round((alreadyAllocated / remaining) * 100)) : 0;

  const nextIncomeBeforeDue =
    dashboard?.next_income_date && pendingCycle && dashboard.next_income_date < pendingCycle.due_date
      ? dashboard.next_income_date
      : null;

  const canSave = Number(amount) > 0 && accountId !== null && cycleId !== null;

  const handleAllocate = async () => {
    if (!canSave || !accountId || cycleId === null) return;
    setSaving(true);
    setError(null);
    try {
      await paymentsApi.createAllocation(cardId, {
        billing_cycle_id: cycleId,
        amount,
        source_account_id: accountId,
      });
      await dispatch(fetchCardDetailThunk(cardId));
      navigate(-1);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = () => {
    navigate(-1);
  };

  if (!detail || !pendingCycle) {
    return (
      <PageShell>
        <TopBar title="Apartar" onBack={() => navigate(-1)} />
        {cardsError ? <ErrorBanner message={cardsError} /> : null}
      </PageShell>
    );
  }

  return (
    <PageShell contentStyle={styles.content}>
      <TopBar title={`Apartar para ${detail.name}`} onBack={() => navigate(-1)} />

      {error ? <ErrorBanner message={error} /> : null}

      <div style={styles.ringContainer}>
        <CycleRing dayIndex={percent} totalDays={100} size={140} strokeWidth={10} />
        <div style={styles.ringCenter}>
          <span style={styles.ringPercent}>{percent}%</span>
          <span style={styles.ringMeta}>
            {formatMoney(alreadyAllocated)} / {formatMoney(remaining)}
          </span>
        </div>
      </div>

      <p style={styles.missingSubtitle}>
        Te faltan <span style={{ color: colors.textPrimary, fontWeight: 800 }}>{formatMoney(missing)}</span> antes del {formatShort(pendingCycle.due_date)}
      </p>

      <div style={styles.infoBanner}>
        <Icon name="information-circle-outline" size={16} color={colors.accent} style={styles.infoIcon} />
        <p style={styles.infoText}>
          {nextIncomeBeforeDue
            ? `Puedes apartar poco a poco: tu próximo ingreso es el ${formatShort(nextIncomeBeforeDue)}.`
            : `Necesitas aportar ${formatMoney(missing)} hoy.\n${
                pendingCycle ? `Tu fecha de pago es el ${formatShort(pendingCycle.due_date)} y no hay días de pago programados antes de esa fecha.` : ''
              }`}
        </p>
      </div>

      <p style={styles.sectionLabel}>MONTO A APARTAR</p>
      <div style={styles.amountRow}>
        <span style={styles.dollarSign}>$</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder={missing.toFixed(2)}
          inputMode="decimal"
          style={styles.amountInput}
        />
      </div>

      <div style={styles.chipsRow}>
        <Pressable onClick={() => setAmount(String((Number(amount) || 0) + 500))} style={styles.quickChip}>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>+$500</span>
        </Pressable>
        <Pressable onClick={() => setAmount(String((Number(amount) || 0) + 1000))} style={styles.quickChip}>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>+$1,000</span>
        </Pressable>
        <Pressable onClick={() => setAmount(missing.toFixed(2))} style={styles.quickChip}>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>Lo que falta</span>
        </Pressable>
      </div>

      <p style={{ ...styles.sectionLabel, alignSelf: 'flex-start' }}>DESDE</p>
      <div style={styles.accountsRow}>
        {accounts.map((a) => (
          <Pressable
            key={a.id}
            onClick={() => setAccountId(a.id)}
            style={dynamicStyles.accountChip(accountId === a.id)}
          >
            <span style={{ color: accountId === a.id ? colors.black : colors.textSecondary, fontWeight: 600, fontSize: fontSize.sm }}>{accountLabel(a)}</span>
          </Pressable>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <PrimaryButton label={`Apartar ${formatMoney(Number(amount) || 0)}`} onPress={handleAllocate} disabled={!canSave} loading={saving} style={{ width: '100%' }} />
      <TextLinkButton label="Retirar del apartado" onPress={handleWithdraw} />
    </PageShell>
  );
}
