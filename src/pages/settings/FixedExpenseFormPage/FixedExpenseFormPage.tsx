import React from 'react';
import { PageShell } from '../../../components/PageShell';
import { TopBar } from '../../../components/TopBar';
import { PrimaryButton, DangerButton } from '../../../components/Buttons';
import { ErrorBanner } from '../../../components/Misc';
import { spacing } from '../../../theme/theme';
import { accountLabel, cardLabel } from '../../../utils/labels';
import { styles } from './FixedExpenseFormPage.styles';
import { useFixedExpenseFormPage } from './FixedExpenseFormPage.hooks';

export default function FixedExpenseFormPage() {
  const {
    navigate,
    isEditing,
    accounts,
    cards,
    categories,
    error,
    name,
    amount,
    dayOfMonth,
    categoryId,
    source,
    saving,
    deleting,
    canSave,
    setName,
    setAmount,
    setDayOfMonth,
    setCategoryId,
    setSource,
    handleSave,
    handleDelete,
  } = useFixedExpenseFormPage();

  return (
    <PageShell>
      <TopBar title={isEditing ? 'Editar gasto fijo' : 'Agregar gasto fijo'} onBack={() => navigate(-1)} />
      {error ? <ErrorBanner message={error} /> : null}

      <p style={styles.label}>Nombre</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej. Renta, Spotify"
        style={styles.input}
      />

      <div style={styles.twoCol}>
        <div style={{ flex: 1 }}>
          <p style={styles.label}>Monto</p>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            inputMode="decimal"
            style={styles.input}
          />
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.label}>Día del mes</p>
          <input
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value.replace(/\D/g, ''))}
            placeholder="1"
            inputMode="numeric"
            style={styles.input}
          />
        </div>
      </div>

      <p style={styles.label}>Categoría</p>
      <div style={styles.chipsRow}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            style={{ ...styles.chip, ...(categoryId === c.id ? styles.chipActive : {}) }}
            onClick={() => setCategoryId(c.id)}
          >
            <span style={{ ...styles.chipLabel, ...(categoryId === c.id ? styles.chipLabelActive : {}) }}>{c.name}</span>
          </button>
        ))}
      </div>

      <p style={styles.label}>Se paga con</p>
      <div style={styles.chipsRow}>
        {accounts.map((a) => (
          <button
            key={`a-${a.id}`}
            type="button"
            style={{
              ...styles.chip,
              ...(source?.kind === 'account' && source.id === a.id ? styles.chipActive : {}),
              ...(isEditing ? styles.chipDisabled : {}),
            }}
            onClick={() => !isEditing && setSource({ kind: 'account', id: a.id })}
            disabled={isEditing}
          >
            <span style={{ ...styles.chipLabel, ...(source?.kind === 'account' && source.id === a.id ? styles.chipLabelActive : {}) }}>
              {accountLabel(a)}
            </span>
          </button>
        ))}
        {cards.map((c) => (
          <button
            key={`c-${c.id}`}
            type="button"
            style={{
              ...styles.chip,
              ...(source?.kind === 'card' && source.id === c.id ? styles.chipActive : {}),
              ...(isEditing ? styles.chipDisabled : {}),
            }}
            onClick={() => !isEditing && setSource({ kind: 'card', id: c.id })}
            disabled={isEditing}
          >
            <span style={{ ...styles.chipLabel, ...(source?.kind === 'card' && source.id === c.id ? styles.chipLabelActive : {}) }}>
              {cardLabel(c)}
            </span>
          </button>
        ))}
      </div>
      {isEditing ? <p style={styles.hint}>El método de pago no se puede cambiar después de crear el gasto fijo</p> : null}

      <PrimaryButton
        label={isEditing ? 'Guardar cambios' : 'Guardar gasto fijo'}
        onPress={handleSave}
        disabled={!canSave}
        loading={saving}
        style={{ marginTop: spacing.xl }}
      />
      {isEditing ? (
        <DangerButton label="Eliminar gasto fijo" onPress={handleDelete} loading={deleting} style={{ marginTop: spacing.md }} />
      ) : null}
    </PageShell>
  );
}
