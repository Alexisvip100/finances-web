import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors, categoryIcons, fontSize, radius, spacing } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCardsThunk } from '../../store/slices/cardsSlice';
import * as transactionsApi from '../../api/transactions';
import { extractErrorMessage } from '../../api/client';
import { Transaction, CategoryBudget } from '../../types';
import { Icon } from '../../components/Icon';
import { IconCircle } from '../../components/Misc';
import { Pressable } from '../../components/Pressable';
import { Portal } from '../../components/Portal';
import { Skeleton } from '../../components/Skeleton';
import { formatMoney } from '../../utils/currency';
import { formatShort, lastDayOfMonth } from '../../utils/dateHelpers';
import { cardLabel } from '../../utils/labels';

const IOS_EASE = [0.32, 0.72, 0, 1] as const;

// Bottom sheet estilo iOS: lista los movimientos de una categoría en el mes
// que se está viendo en Presupuesto, para responder "¿qué compré aquí?".
export function CategoryTransactionsSheet({
  category,
  month,
  onClose,
}: {
  category: CategoryBudget | null;
  month: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const cards = useAppSelector((s) => s.cards.items);

  const [items, setItems] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    dispatch(fetchCardsThunk());
    setItems(null);
    setError(null);
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = lastDayOfMonth(year, monthNum);
    const filters = {
      category_id: category.category_id ?? undefined,
      from_date: `${month}-01`,
      to_date: `${month}-${String(lastDay).padStart(2, '0')}`,
    };
    transactionsApi
      .fetchTransactions(filters)
      .then((txns) => setItems(category.category_id === null ? txns.filter((t) => t.category_id === null) : txns))
      .catch((e) => setError(extractErrorMessage(e)));
  }, [category, month, dispatch]);

  const sorted = useMemo(() => (items ? [...items].sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1)) : []), [items]);

  const sourceLabel = (t: Transaction) => {
    if (t.credit_card_id) {
      const card = cards.find((c) => c.id === t.credit_card_id);
      return card ? `${cardLabel(card)} ••••${card.last_four}` : 'Tarjeta';
    }
    const account = accounts.find((a) => a.id === t.account_id);
    return account?.name ?? 'Efectivo';
  };

  return (
    <Portal>
      <AnimatePresence>
      {category ? (
        <motion.div
          key="category-transactions-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: colors.overlay }} />
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { duration: 0.36, ease: IOS_EASE } }}
            exit={{ y: '100%', transition: { duration: 0.28, ease: IOS_EASE } }}
            style={{
              position: 'relative',
              background: colors.surfaceAlt,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              padding: spacing.lg,
              paddingBottom: spacing.xxl,
              maxHeight: '80%',
              overflowY: 'auto',
              maxWidth: 720,
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.divider, margin: '0 auto', marginBottom: spacing.lg }} />

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing.lg }}>
              <IconCircle
                name={categoryIcons[category.category_name] ?? 'file-tray-outline'}
                bg={colors.surface}
                color={colors.textSecondary}
                size={40}
              />
              <div style={{ flex: 1, marginLeft: spacing.md }}>
                <p style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: 800, margin: 0 }}>{category.category_name}</p>
                <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>{formatMoney(category.spent)} este mes</p>
              </div>
              <Pressable
                onClick={onClose}
                style={{ width: 32, height: 32, borderRadius: 16, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name="close" size={18} color={colors.textPrimary} />
              </Pressable>
            </div>

            {error ? (
              <p style={{ color: colors.danger, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>{error}</p>
            ) : items === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', background: colors.surface, borderRadius: radius.card, padding: spacing.md, gap: spacing.md }}>
                    <Skeleton width={36} height={36} radius={18} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Skeleton width="55%" height={14} />
                      <Skeleton width="35%" height={11} />
                    </div>
                    <Skeleton width={56} height={14} />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', padding: `${spacing.xl}px 0` }}>
                No hay compras registradas en esta categoría este mes.
              </p>
            ) : (
              sorted.map((t) => (
                <div
                  key={t.id}
                  style={{ display: 'flex', alignItems: 'center', background: colors.surface, borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 700, margin: 0 }}>
                      {t.description || category.category_name}
                    </p>
                    <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: '2px 0 0' }}>
                      {formatShort(t.transaction_date)} · {sourceLabel(t)}
                      {t.fixed_expense_id !== null ? ' · Fijo' : ''}
                    </p>
                  </div>
                  <span style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: 800, marginLeft: spacing.sm }}>
                    {formatMoney(t.amount)}
                  </span>
                </div>
              ))
            )}
          </motion.div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </Portal>
  );
}
