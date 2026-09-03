import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { Pressable } from '../../../components/Pressable';
import { Icon } from '../../../components/Icon';
import { AddExpenseButton } from '../../../components/AddExpenseButton';
import { DangerButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { colors, fontSize, radius, spacing } from '../../../theme/theme';
import { formatMoney } from '../../../utils/currency';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { dynamicStyles, styles } from './SettingsPage.styles';
import { useSettingsPage } from './SettingsPage.hooks';

export default function SettingsPage() {
  const {
    navigate,
    accounts,
    cards,
    incomes,
    fixedExpenses,
    categories,
    user,
    error,
    mode,
    setMode,
    handleLogout,
    themeOptions,
  } = useSettingsPage();

  return (
    <PageShell contentStyle={{ paddingBottom: 140, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <h1 style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: 800, margin: 0 }}>Ajustes</h1>
        <AddExpenseButton />
      </div>
      {user ? <p style={{ color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xl }}>{user.email}</p> : null}

      {error ? <ErrorBanner message={error} /> : null}

      <SectionLabel label="Apariencia" />
      <div style={styles.themeToggleRow}>
        {themeOptions.map((opt) => {
          const active = mode === opt.value;
          return (
            <Pressable
              key={opt.value}
              onClick={() => setMode(opt.value)}
              style={dynamicStyles.themeTab(active)}
            >
              <Icon name={opt.icon} size={15} color={active ? colors.accentContrast : colors.textSecondary} />
              {opt.label}
            </Pressable>
          );
        })}
      </div>

      <SectionLabel label="Cuentas" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        {accounts.map((a, idx) => (
          <Row
            key={`account-${a.id}`}
            icon={a.type === 'CASH' ? 'cash-outline' : 'business-outline'}
            label={accountLabel(a)}
            value={formatMoney(a.balance)}
            last={idx === accounts.length - 1 && cards.length === 0}
            onPress={() => navigate(`/ajustes/cuentas/${a.id}`)}
          />
        ))}
        {cards.map((c, idx) => (
          <Row
            key={`card-${c.id}`}
            icon="card-outline"
            label={cardLabel(c)}
            value={`••••${c.last_four}`}
            last={idx === cards.length - 1}
            onPress={() => navigate(`/tarjetas/${c.id}`)}
          />
        ))}
      </div>
      <AddButton label="Agregar cuenta" onPress={() => navigate('/ajustes/cuentas/nueva')} />

      <SectionLabel label="Ingresos" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        {incomes.map((i, idx) => (
          <Row
            key={`income-${i.id}`}
            icon="cash-outline"
            label={i.name}
            value={formatMoney(i.amount)}
            last={idx === incomes.length - 1}
            onPress={() => navigate(`/ajustes/ingresos/${i.id}`)}
          />
        ))}
      </div>
      <AddButton label="Agregar ingreso" onPress={() => navigate('/ajustes/ingresos/nuevo')} />

      <SectionLabel label="Gastos fijos" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        {fixedExpenses.map((f, idx) => (
          <Row
            key={`fixed-${f.id}`}
            icon="calendar-outline"
            label={f.name}
            value={formatMoney(f.amount)}
            last={idx === fixedExpenses.length - 1}
            onPress={() => navigate(`/ajustes/gastos-fijos/${f.id}`)}
          />
        ))}
      </div>
      <AddButton label="Agregar gasto fijo" onPress={() => navigate('/ajustes/gastos-fijos/nuevo')} />

      <SectionLabel label="General" />
      <div style={{ background: colors.surface, borderRadius: radius.card, paddingLeft: spacing.lg, paddingRight: spacing.lg }}>
        <Row
          icon="pricetags-outline"
          label="Categorías"
          value={`${categories.length}`}
          onPress={() => navigate('/ajustes/categorias')}
        />
        <Row
          icon="time-outline"
          label="Historial de compras"
          onPress={() => navigate('/ajustes/historial-gastos')}
        />
        <Row
          icon="wallet-outline"
          label="Historial de ingresos"
          last
          onPress={() => navigate('/ajustes/historial-ingresos')}
        />
      </div>

      <div style={{ marginTop: spacing.xxl }}>
        <DangerButton label="Cerrar sesión" onPress={handleLogout} />
      </div>
    </PageShell>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.md, marginTop: spacing.xl }}>
      {label}
    </p>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onClick={onPress}
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: `${spacing.md}px 0`, marginTop: spacing.xs }}
    >
      <Icon name="add" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
      <span style={{ color: colors.accent, fontSize: fontSize.sm, fontWeight: 700 }}>{label}</span>
    </Pressable>
  );
}

function Row({
  icon,
  label,
  value,
  last,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onClick={onPress}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: `${spacing.lg}px 0`,
        borderBottom: last ? 'none' : `1px solid ${colors.divider}`,
      }}
    >
      <Icon name={icon} size={18} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
      <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 600, flex: 1 }}>{label}</span>
      {value ? <span style={{ color: colors.textSecondary, fontSize: fontSize.md, fontWeight: 700, marginRight: spacing.sm }}>{value}</span> : null}
      <Icon name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}
