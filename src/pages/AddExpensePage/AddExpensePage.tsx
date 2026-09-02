import React from 'react';
import { PageShell } from '../../components/PageShell';
import { Pressable } from '../../components/Pressable';
import { Icon } from '../../components/Icon';
import { Portal } from '../../components/Portal';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { AmountInput } from '../../components/AmountInput';
import { ErrorBanner } from '../../components/Misc';
import { TextField } from '../../components/TextField';
import { colors, categoryIcons } from '../../theme/theme';
import { formatShort, todayISO, toISODate } from '../../utils/dateHelpers';
import { DateSheetPicker } from '../../components/DateSheetPicker';
import { accountLabel, cardLabel } from '../../utils/labels';
import { dynamicStyles, styles } from './AddExpensePage.styles';
import { useAddExpensePage } from './AddExpensePage.hooks';


export default function AddExpensePage() {

  const {
    amount,
    description,
    method,
    categoryId,
    categoryPickerOpen,
    newCategoryName,
    isMsi,
    months,
    saving,
    datePickerOpen,
    customDate,
    navigate,
    setAmount,
    setDescription,
    setMethod,
    setCategoryId,
    setCategoryPickerOpen,
    setNewCategoryName,
    setIsMsi,
    setMonths,
    setDatePickerOpen,
    setCustomDate,
    handleAddCategory,
    handleSave,
    selectedCard,
    selectedCategory,
    preview,
    canSave,
    accounts,
    cards,
    categories,
    error, } = useAddExpensePage()
  return (
    <PageShell contentStyle={styles.pageContent}>
      <div style={styles.handleBar} />
      <div style={styles.topBar}>
        <Pressable
          onClick={() => navigate(-1)}
          style={styles.closeButton}
        >
          <Icon name="close" size={18} color={colors.textPrimary} />
        </Pressable>
        <span style={styles.topBarTitle}>Registrar gasto</span>
        <div style={styles.topBarSpacer} />
      </div>

      <div style={styles.dateRow}>
        <Pressable
          onClick={() => setDatePickerOpen(true)}
          style={styles.dateButton}
        >
          <Icon name="calendar-outline" size={14} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <span style={styles.dateButtonText}>
            {customDate === todayISO() ? 'Hoy' : formatShort(customDate)}
          </span>
          <Icon name="chevron-down" size={12} color={colors.textSecondary} style={{ marginLeft: 8 }} />
        </Pressable>
      </div>

      <DateSheetPicker open={datePickerOpen} value={customDate} onClose={() => setDatePickerOpen(false)} onSelect={setCustomDate} />

      <AmountInput value={amount} onChangeText={setAmount} size="amountLg" autoFocus />

      {error ? <ErrorBanner message={error} /> : null}

      <p style={styles.sectionLabel}>¿Qué compraste?</p>
      <TextField value={description} onChangeText={setDescription} placeholder="Ej. Café, gasolina, súper" style={{ marginBottom: 0 }} />

      <p style={styles.sectionLabel}>Cuenta o tarjeta</p>
      <div style={styles.chipsContainer}>
        {accounts.map((a) => {
          const active = method?.kind === 'account' && method.id === a.id;
          return (
            <Pressable
              key={`account-${a.id}`}
              onClick={() => setMethod({ kind: 'account', id: a.id })}
              style={dynamicStyles.chip(active)}
            >
              <Icon name={a.type === 'CASH' ? 'cash-outline' : 'business-outline'} size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <span style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 600 }}>{accountLabel(a)}</span>
            </Pressable>
          );
        })}
        {cards.map((c) => {
          const active = method?.kind === 'card' && method.id === c.id;
          return (
            <Pressable
              key={`card-${c.id}`}
              onClick={() => setMethod({ kind: 'card', id: c.id })}
              style={dynamicStyles.chip(active)}
            >
              <Icon name="card-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <span style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 600 }}>{cardLabel(c)}</span>
            </Pressable>
          );
        })}
      </div>

      {preview ? (
        <div style={styles.previewCard}>
          <Icon name="information-circle-outline" size={16} color={colors.warning} style={{ marginRight: 8 }} />
          <span style={styles.previewText}>
            Se paga el {formatShort(toISODate(preview.due))} · ciclo {formatShort(toISODate(preview.start))} – {formatShort(toISODate(preview.end))}
          </span>
        </div>
      ) : null}

      <p style={styles.sectionLabel}>Categoría (opcional)</p>
      <Pressable
        onClick={() => setCategoryPickerOpen(true)}
        style={styles.categorySelector}
      >
        <Icon
          name={categoryIcons[selectedCategory?.name ?? ''] ?? 'pricetag-outline'}
          size={16}
          color={colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <span style={styles.categorySelectorText}>
          {selectedCategory ? selectedCategory.name : 'Sin categoría'}
        </span>
        <Icon name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {categoryPickerOpen ? (
        <Portal>
          <div style={styles.modalBackdrop}>
            <div onClick={() => setCategoryPickerOpen(false)} style={styles.modalOverlay} />
            <div style={styles.modalSheet}>
              <div style={styles.modalHeader}>
                <p style={styles.modalTitle}>Seleccionar categoría</p>
                <Pressable onClick={() => setCategoryPickerOpen(false)} style={{ padding: 4 }}>
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </div>

              <div style={styles.modalList}>
                <Pressable
                  onClick={() => {
                    setCategoryId(null);
                    setCategoryPickerOpen(false);
                  }}
                  style={styles.modalRow}
                >
                  <span style={styles.modalRowLabel}>Sin categoría</span>
                  {categoryId === null ? <Icon name="checkmark" size={16} color={colors.accent} /> : null}
                </Pressable>

                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      setCategoryPickerOpen(false);
                    }}
                    style={styles.modalRow}
                  >
                    <Icon
                      name={categoryIcons[c.name] ?? 'pricetag-outline'}
                      size={16}
                      color={colors.textSecondary}
                      style={{ marginRight: 8 }}
                    />
                    <span style={styles.modalRowLabel}>{c.name}</span>
                    {categoryId === c.id ? <Icon name="checkmark" size={16} color={colors.accent} /> : null}
                  </Pressable>
                ))}
              </div>

              <div style={styles.modalInputRow}>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nueva categoría…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                  }}
                  style={styles.modalInput}
                />
                <Pressable
                  onClick={handleAddCategory}
                  style={styles.modalAddBtn}
                >
                  <Icon name="add" size={18} color={colors.black} />
                </Pressable>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}

      {selectedCard ? (
        <div style={styles.msiRow}>
          <div style={{ flex: 1 }}>
            <p style={styles.msiLabel}>Meses sin intereses</p>
            <p style={styles.msiSub}>Diferir este pago</p>
          </div>
          <label style={styles.msiSwitchWrap}>
            <input
              type="checkbox"
              checked={isMsi}
              onChange={(e) => setIsMsi(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={dynamicStyles.msiSwitchTrack(isMsi)} />
            <span style={dynamicStyles.msiSwitchThumb(isMsi)} />
          </label>
        </div>
      ) : null}
      {selectedCard && isMsi ? (
        <input
          value={months}
          onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))}
          placeholder="Meses"
          inputMode="numeric"
          style={styles.msiInput}
        />
      ) : null}

      <div style={{ flex: 1 }} />

      <div style={styles.bottomActions}>
        <SecondaryButton label="Cancelar" onPress={() => navigate(-1)} style={{ flex: 1 }} />
        <PrimaryButton label="Guardar gasto" onPress={handleSave} disabled={!canSave} loading={saving} style={{ flex: 1 }} />
      </div>
    </PageShell>
  );
}
