import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../../components/PageShell';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { AddExpenseButton } from '../../../components/AddExpenseButton';
import { DangerButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { ThemeMode, useThemeMode } from '../../../theme/ThemeModeContext';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchAccountsThunk } from '../../../store/slices/accountsSlice';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import { fetchIncomesThunk } from '../../../store/slices/incomesSlice';
import { fetchFixedExpensesThunk } from '../../../store/slices/fixedExpensesSlice';
import { fetchCategoriesThunk } from '../../../store/slices/categoriesSlice';
import { logoutThunk } from '../../../store/slices/authSlice';
import { formatMoney } from '../../../utils/currency';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { dynamicStyles, styles } from './SettingsPage.styles';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'Automático', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts);
  const cards = useAppSelector((s) => s.cards);
  const incomes = useAppSelector((s) => s.incomes);
  const fixedExpenses = useAppSelector((s) => s.fixedExpenses);
  const categories = useAppSelector((s) => s.categories);
  const user = useAppSelector((s) => s.auth.user);
  const { mode, setMode } = useThemeMode();

  useEffect(() => {
    dispatch(fetchAccountsThunk());
    dispatch(fetchCardsThunk());
    dispatch(fetchIncomesThunk());
    dispatch(fetchFixedExpensesThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  return (
    <PageShell contentStyle={{ paddingBottom: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: 0 }}>Ajustes</h1>
        <AddExpenseButton />
      </div>
      {user ? <p style={{ color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xl }}>{user.email}</p> : null}

      {accounts.error ? <ErrorBanner message={accounts.error} /> : null}

      <SectionLabel label="Apariencia" />
      <div style={styles.themeToggleRow}>
        {THEME_OPTIONS.map((opt) => {
          const active = mode === opt.value;
          return (
            <Pressable
              key={opt.value}
              onClick={() => setMode(opt.value)}
              style={dynamicStyles.themeTab(active)}
            >
              <Icon name={opt.icon} size={15} color={active ? colors.black : colors.textSecondary} />
              {opt.label}
            </Pressable>
          );
        })}
      </div>

      <SectionLabel label="Cuentas" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        {accounts.items.map((a, idx) => (
          <Row
            key={`account-${a.id}`}
            icon={a.type === 'CASH' ? 'cash-outline' : 'business-outline'}
            label={accountLabel(a)}
            value={formatMoney(a.balance)}
            last={idx === accounts.items.length - 1 && cards.items.length === 0}
            onPress={() => navigate(`/ajustes/cuentas/${a.id}`)}
          />
        ))}
        {cards.items.map((c, idx) => (
          <Row
            key={`card-${c.id}`}
            icon="card-outline"
            label={cardLabel(c)}
            meta={`••••${c.last_four} · crédito`}
            value={formatMoney(c.credit_limit)}
            last={idx === cards.items.length - 1}
            onPress={() => navigate(`/tarjetas/${c.id}`)}
          />
        ))}
        <AddRow label="Agregar cuenta de efectivo" onPress={() => navigate('/ajustes/cuentas/nueva')} />
      </div>

      <SectionLabel label="Ingresos" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        {incomes.items.map((inc, idx) => (
          <Row
            key={inc.id}
            icon="sync-outline"
            label={inc.name}
            meta={inc.frequency === 'BIWEEKLY' ? 'Quincenal' : inc.frequency === 'MONTHLY' ? 'Mensual' : 'Variable'}
            value={formatMoney(inc.amount)}
            last={idx === incomes.items.length - 1}
            onPress={() => navigate(`/ajustes/ingresos/${inc.id}`)}
          />
        ))}
        <AddRow label="Agregar ingreso" onPress={() => navigate('/ajustes/ingresos/nuevo')} />
      </div>

      <SectionLabel label="Gastos fijos" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        {fixedExpenses.items.map((f, idx) => (
          <Row
            key={f.id}
            icon="home-outline"
            label={f.name}
            meta={`día ${f.day_of_month}`}
            value={formatMoney(f.amount)}
            last={idx === fixedExpenses.items.length - 1}
            onPress={() => navigate(`/ajustes/gastos-fijos/${f.id}`)}
          />
        ))}
        <AddRow label="Agregar gasto fijo" onPress={() => navigate('/ajustes/gastos-fijos/nuevo')} />
      </div>

      <SectionLabel label="Categorías y límites" />
      <LinkRow icon="pricetags-outline" label={`${categories.items.length} categorías`} onPress={() => navigate('/ajustes/categorias')} />

      <SectionLabel label="Movimientos" />
      <LinkRow icon="receipt-outline" label="Historial de gastos" onPress={() => navigate('/ajustes/historial-gastos')} />
      <LinkRow
        icon="cash-outline"
        label="Historial de ingresos"
        onPress={() => navigate('/ajustes/historial-ingresos')}
        style={{ marginTop: spacing.md }}
      />

      <DangerButton label="Cerrar sesión" onPress={() => dispatch(logoutThunk())} style={{ marginTop: spacing.xxl }} />
    </PageShell>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={styles.sectionLabel}>
      {label.toUpperCase()}
    </p>
  );
}

function Row({
  icon,
  label,
  meta,
  value,
  last,
  onPress,
}: {
  icon: string;
  label: string;
  meta?: string;
  value: string;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottom: last ? 'none' : `1px solid ${colors.divider}`,
      }}
    >
      <Icon name={icon} size={18} color={colors.textSecondary} style={{ marginRight: spacing.md, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, margin: 0 }}>{label}</p>
        {meta ? <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>{meta}</p> : null}
      </div>
      <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700 }}>{value}</span>
      <Icon name="chevron-forward" size={14} color={colors.textMuted} style={{ marginLeft: spacing.sm, flexShrink: 0 }} />
    </Pressable>
  );
}

function AddRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onClick={onPress} style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', paddingTop: spacing.lg, paddingBottom: spacing.lg }}>
      <Icon name="add" size={16} color={colors.accent} style={{ marginRight: spacing.sm, flexShrink: 0 }} />
      <span style={{ color: colors.accent, fontWeight: 700, fontSize: fontSize.sm }}>{label}</span>
    </Pressable>
  );
}

function LinkRow({ icon, label, onPress, style }: { icon: string; label: string; onPress: () => void; style?: React.CSSProperties }) {
  return (
    <Pressable
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        background: colors.surface,
        borderRadius: radius.card,
        padding: spacing.lg,
        ...style,
      }}
    >
      <Icon name={icon} size={18} color={colors.textSecondary} style={{ marginRight: spacing.md, flexShrink: 0 }} />
      <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, flex: 1 }}>{label}</span>
      <Icon name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}
