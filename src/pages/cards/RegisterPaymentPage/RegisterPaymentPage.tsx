import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, SecondaryButton } from '../../../components/Buttons';
import { Badge, ErrorBanner } from '../../../components/Misc';
import { Pressable } from '../../../components/Pressable';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardDetailThunk } from '../../../store/slices/cardsSlice';
import { fetchDashboardThunk } from '../../../store/slices/dashboardSlice';
import { extractErrorMessage } from '../../../api/client';
import * as paymentsApi from '../../../api/payments';
import { formatMoney } from '../../../utils/currency';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { optionRowStyle, radioDotStyle, radioStyle, sourceChipStyle } from './RegisterPaymentPage.styles';

type SourceSelection = { kind: 'account'; id: number } | { kind: 'allocation' } | null;

export default function RegisterPaymentPage() {
  const navigate = useNavigate();
  const { cardId: cardIdParam } = useParams();
  const cardId = Number(cardIdParam);
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const dashboard = useAppSelector((s) => s.dashboard.data);
  const detail = useAppSelector((s) => s.cards.detailById[cardId]);
  const cardsError = useAppSelector((s) => s.cards.error);

  const [mode, setMode] = useState<'total' | 'other'>('total');
  const [customAmount, setCustomAmount] = useState('');
  const [source, setSource] = useState<SourceSelection>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCardDetailThunk(cardId));
    dispatch(fetchAccountsThunk());
    dispatch(fetchDashboardThunk());
  }, [cardId, dispatch]);

  const pending = detail?.pending_cycle;
  const cycleId = pending?.id ?? null;
  const remaining = pending ? Number(pending.total_amount) - Number(pending.paid_amount) : 0;
  const allocated = detail ? Number(detail.allocated_for_pending_cycle) : 0;

  useEffect(() => {
    if (!source) {
      if (allocated > 0) setSource({ kind: 'allocation' });
      else if (accounts.length > 0) setSource({ kind: 'account', id: accounts[0].id });
    }
  }, [source, allocated, accounts]);

  const amount = mode === 'total' ? remaining : Number(customAmount) || 0;
  const canSave = amount > 0 && amount <= remaining && source !== null && cycleId !== null;
  const committedAfter = Math.max(0, remaining - amount);

  const handleConfirm = async () => {
    if (!canSave || !source || cycleId === null) return;
    setSaving(true);
    setError(null);
    try {
      await paymentsApi.createPayment(cardId, {
        billing_cycle_id: cycleId,
        amount: String(amount),
        source_type: source.kind === 'allocation' ? 'ALLOCATION' : 'ACCOUNT',
        source_account_id: source.kind === 'account' ? source.id : undefined,
      });
      await dispatch(fetchCardDetailThunk(cardId));
      navigate(-1);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!detail || !pending) {
    return (
      <PageShell>
        <TopBar title="Registrar pago" onBack={() => navigate(-1)} />
        {cardsError ? <ErrorBanner message={cardsError} /> : null}
      </PageShell>
    );
  }

  return (
    <PageShell contentStyle={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <TopBar title="Registrar pago" onBack={() => navigate(-1)} />
      <div style={{ marginBottom: spacing.xs }}>
        <Badge label="SIN INTERESES" tone="success" />
      </div>
      <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.xl, marginTop: spacing.xs }}>{cardLabel(detail)}</p>

      {error ? <ErrorBanner message={error} /> : null}

      <Pressable onClick={() => setMode('total')} style={{ ...optionRowStyle, borderColor: mode === 'total' ? colors.accent : 'transparent' }}>
        <div style={{ ...radioStyle, borderColor: mode === 'total' ? colors.accent : colors.divider }}>{mode === 'total' ? <div style={radioDotStyle} /> : null}</div>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, flex: 1 }}>Pago total</span>
        <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800 }}>{formatMoney(remaining)}</span>
      </Pressable>

      <Pressable onClick={() => setMode('other')} style={{ ...optionRowStyle, borderColor: mode === 'other' ? colors.accent : 'transparent' }}>
        <div style={{ ...radioStyle, borderColor: mode === 'other' ? colors.accent : colors.divider }}>{mode === 'other' ? <div style={radioDotStyle} /> : null}</div>
        <div style={{ flex: 1 }}>
          <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700 }}>Otro monto</span>
          {mode === 'other' ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
              <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, marginRight: 4 }}>$</span>
              <input
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                inputMode="decimal"
                style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, padding: 0 }}
              />
            </div>
          ) : null}
        </div>
      </Pressable>

      <p style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 700, marginTop: spacing.lg, marginBottom: spacing.md }}>¿De dónde sale?</p>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {allocated > 0 ? (
          <Pressable
            onClick={() => setSource({ kind: 'allocation' })}
            style={{ ...sourceChipStyle, background: source?.kind === 'allocation' ? colors.accent : colors.surface }}
          >
            <span style={{ color: source?.kind === 'allocation' ? colors.black : colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>
              Apartado de esta tarjeta ({formatMoney(allocated)})
            </span>
          </Pressable>
        ) : null}
        {accounts.map((a) => (
          <Pressable
            key={a.id}
            onClick={() => setSource({ kind: 'account', id: a.id })}
            style={{ ...sourceChipStyle, background: source?.kind === 'account' && source.id === a.id ? colors.accent : colors.surface }}
          >
            <span style={{ color: source?.kind === 'account' && source.id === a.id ? colors.black : colors.textSecondary, fontSize: fontSize.sm, fontWeight: 600 }}>
              {accountLabel(a)}
            </span>
          </Pressable>
        ))}
      </div>

      {dashboard ? (
        <div style={{ background: colors.surface, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing.sm}px 0` }}>
            <span style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Disponible real:</span>
            <span style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: 700 }}>
              {formatMoney(dashboard.available)} → {formatMoney(dashboard.available)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing.sm}px 0` }}>
            <span style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Comprometido baja a</span>
            <span style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: 700 }}>{formatMoney(committedAfter)}</span>
          </div>
        </div>
      ) : null}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md, paddingTop: spacing.lg }}>
        <SecondaryButton label="Cancelar" onPress={() => navigate(-1)} style={{ flex: 1 }} />
        <PrimaryButton label="Confirmar pago" onPress={handleConfirm} disabled={!canSave} loading={saving} style={{ flex: 1 }} />
      </div>
    </PageShell>
  );
}
