import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors, categoryIcons } from '../../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchCardsThunk } from '../../../store/slices/cardsSlice';
import * as transactionsApi from '../../../api/transactions';
import { extractErrorMessage } from '../../../api/client';
import { Transaction, CategoryBudget } from '../../../types';
import { Icon } from '../../../components/Icon';
import { IconCircle } from '../../../components/Misc';
import { Pressable } from '../../../components/Pressable';
import { Portal } from '../../../components/Portal';
import { Skeleton } from '../../../components/Skeleton';
import { formatMoney } from '../../../utils/currency';
import { formatShort, lastDayOfMonth } from '../../../utils/dateHelpers';
import { cardLabel } from '../../../utils/labels';
import { IOS_EASE, styles } from './CategoryTransactionsSheet.styles';

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
          style={styles.overlayWrapper}
        >
          <div onClick={onClose} style={styles.backdrop} />
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
            style={styles.sheet}
          >
            <div style={styles.handleBar} />

            <div style={styles.header}>
              <IconCircle
                name={categoryIcons[category.category_name] ?? 'file-tray-outline'}
                bg={colors.surface}
                color={colors.textSecondary}
                size={40}
              />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <p style={styles.headerTitle}>{category.category_name}</p>
                <p style={styles.headerSub}>{formatMoney(category.spent)} este mes</p>
              </div>
              <Pressable
                onClick={onClose}
                style={styles.closeBtn}
              >
                <Icon name="close" size={18} color={colors.textPrimary} />
              </Pressable>
            </div>

            {error ? (
              <p style={styles.errorText}>{error}</p>
            ) : items === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={styles.skeletonRow}>
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
              <p style={styles.emptyText}>
                No hay compras registradas en esta categoría este mes.
              </p>
            ) : (
              sorted.map((t) => (
                <div
                  key={t.id}
                  style={styles.txnRow}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.txnLabel}>
                      {t.description || category.category_name}
                    </p>
                    <p style={styles.txnMeta}>
                      {formatShort(t.transaction_date)} · {sourceLabel(t)}
                      {t.fixed_expense_id !== null ? ' · Fijo' : ''}
                    </p>
                  </div>
                  <span style={styles.txnAmount}>
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
