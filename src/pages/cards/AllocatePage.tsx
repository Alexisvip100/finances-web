import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { TopBar } from '../../components/TopBar';
import { PrimaryButton, TextLinkButton } from '../../components/Buttons';
import { CycleRing } from '../../components/cards/CycleRing';
import { ErrorBanner } from '../../components/Misc';
import { Pressable } from '../../components/Pressable';
import { Icon } from '../../components/Icon';
import { colors, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAccountsThunk } from '../../store/slices/accountsSlice';
import { fetchCardDetailThunk } from '../../store/slices/cardsSlice';
import { fetchDashboardThunk } from '../../store/slices/dashboardSlice';
import { extractErrorMessage } from '../../api/client';
import * as paymentsApi from '../../api/payments';
import { formatMoney } from '../../utils/currency';
import { formatShort } from '../../utils/dateHelpers';
import { accountLabel } from '../../utils/labels';

// A diferencia del sheet móvil (que recibía cycleId/remaining como
// route.params), esta ruta web solo recibe :cardId — el ciclo pendiente y sus
// montos se derivan del detalle de tarjeta cargado por cardId.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accountId, accounts]);

  const pendingCycle = detail?.pending_cycle;
  const cycleId = pendingCycle?.id ?? null;
  const remaining = pendingCycle ? Number(pendingCycle.total_amount) - Number(pendingCycle.paid_amount) : 0;
  const alreadyAllocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;
  const missing = Math.max(0, remaining - alreadyAllocated);
  const percent = remaining > 0 ? Math.min(100, Math.round((alreadyAllocated / remaining) * 100)) : 0;

  // Simplificación deliberada: solo consideramos el PRÓXIMO ingreso conocido
  // (dashboard.next_income_date), no la lista completa de pagos entre hoy y
  // el vencimiento. Cubre el caso más común (falta 0 o 1 quincena) tal cual
  // lo muestra la spec; para más de un pago pendiente habría que traer todas
  // las ocurrencias de Income antes de due_date desde el backend.
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
    // El retiro real de un apartado específico se hace desde el detalle de
    // tarjeta (lista de apartados) — aquí solo cerramos la página de "apartar".
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
    <PageShell contentStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%' }}>
      <TopBar title={`Apartar para ${detail.name}`} onBack={() => navigate(-1)} />

      {error ? <ErrorBanner message={error} /> : null}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
        <CycleRing dayIndex={percent} totalDays={100} size={140} strokeWidth={10} />
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800 }}>{percent}%</span>
          <span style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>
            {formatMoney(alreadyAllocated)} / {formatMoney(remaining)}
          </span>
        </div>
      </div>

      <p style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg }}>
        Te faltan <span style={{ color: colors.textPrimary, fontWeight: 800 }}>{formatMoney(missing)}</span> antes del {formatShort(pendingCycle.due_date)}
      </p>

      <div style={{ display: 'flex', flexDirection: 'row', background: colors.accentMuted, borderRadius: radius.input, padding: spacing.lg, width: '100%', marginBottom: spacing.xl }}>
        <Icon name="information-circle-outline" size={16} color={colors.accent} style={{ marginRight: spacing.sm, flexShrink: 0 }} />
        <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, flex: 1, lineHeight: '18px', margin: 0, whiteSpace: 'pre-line' }}>
          {nextIncomeBeforeDue
            ? `Puedes apartar poco a poco: tu próximo ingreso es el ${formatShort(nextIncomeBeforeDue)}.`
            : `Necesitas aportar ${formatMoney(missing)} hoy.\n${
                pendingCycle ? `Tu fecha de pago es el ${formatShort(pendingCycle.due_date)} y no hay días de pago programados antes de esa fecha.` : ''
              }`}
        </p>
      </div>

      <p style={sectionLabelStyle}>MONTO A APARTAR</p>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.amountMd, fontWeight: 800, lineHeight: 1.1, marginRight: spacing.xs }}>$</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder={missing.toFixed(2)}
          inputMode="decimal"
          style={{ color: colors.textPrimary, fontSize: fontSize.amountMd, fontWeight: 800, lineHeight: 1.1, minWidth: 80 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        <Pressable onClick={() => setAmount(String((Number(amount) || 0) + 500))} style={quickChipStyle}>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>+$500</span>
        </Pressable>
        <Pressable onClick={() => setAmount(String((Number(amount) || 0) + 1000))} style={quickChipStyle}>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>+$1,000</span>
        </Pressable>
        <Pressable onClick={() => setAmount(missing.toFixed(2))} style={quickChipStyle}>
          <span style={{ color: colors.textSecondary, fontWeight: 700, fontSize: fontSize.sm }}>Lo que falta</span>
        </Pressable>
      </div>

      <p style={{ ...sectionLabelStyle, alignSelf: 'flex-start' }}>DESDE</p>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, width: '100%', marginBottom: spacing.lg }}>
        {accounts.map((a) => (
          <Pressable
            key={a.id}
            onClick={() => setAccountId(a.id)}
            style={{ padding: `${spacing.md}px ${spacing.lg}px`, borderRadius: radius.pill, background: accountId === a.id ? colors.accent : colors.surface }}
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

const sectionLabelStyle: React.CSSProperties = { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.8, marginBottom: spacing.sm };
const quickChipStyle: React.CSSProperties = { padding: `${spacing.sm}px ${spacing.lg}px`, borderRadius: radius.pill, background: colors.surface };
