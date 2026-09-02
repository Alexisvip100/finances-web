import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { colors, categoryIcons } from '../../../theme/theme';
import { Icon } from '../../../components/Icon';
import { IconCircle } from '../../../components/Misc';
import { Pressable } from '../../../components/Pressable';
import { Portal } from '../../../components/Portal';
import { Skeleton } from '../../../components/Skeleton';
import { formatMoney } from '../../../utils/currency';
import { formatShort } from '../../../utils/dateHelpers';
import { IOS_EASE, styles } from './CategoryTransactionsSheet.styles';
import { useCategoryTransactionsSheet } from './CategoryTransactionsSheet.hooks';
import type { CategoryTransactionsSheetProps } from './CategoryTransactionsSheet.types';

export function CategoryTransactionsSheet(props: CategoryTransactionsSheetProps) {
  const { category, onClose } = props;
  const { items, sorted, error, effectiveCategoryName, sourceLabel } = useCategoryTransactionsSheet(props);

  return (
    <Portal>
      <AnimatePresence>
        {category !== null || props.categoryId !== undefined ? (
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
                  name={categoryIcons[effectiveCategoryName] ?? 'file-tray-outline'}
                  bg={colors.surface}
                  color={colors.textSecondary}
                  size={40}
                />
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <p style={styles.headerTitle}>{effectiveCategoryName}</p>
                  <p style={styles.headerSubtitle}>
                    {items ? `${items.length} ${items.length === 1 ? 'movimiento' : 'movimientos'}` : 'Cargando…'}
                  </p>
                </div>
                <Pressable onClick={onClose} style={styles.closeBtn}>
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </Pressable>
              </div>

              <div style={styles.list}>
                {error ? (
                  <p style={styles.emptyText}>{error}</p>
                ) : items === null ? (
                  <div style={styles.skeletonContainer}>
                    <Skeleton width="100%" height={56} radius={14} />
                    <Skeleton width="100%" height={56} radius={14} />
                    <Skeleton width="100%" height={56} radius={14} />
                  </div>
                ) : sorted.length === 0 ? (
                  <p style={styles.emptyText}>Sin movimientos este mes.</p>
                ) : (
                  sorted.map((t) => (
                    <div key={t.id} style={styles.txnItem}>
                      <div style={{ flex: 1 }}>
                        <p style={styles.txnDescription}>{t.description || effectiveCategoryName}</p>
                        <p style={styles.txnMeta}>
                          {formatShort(t.transaction_date)} · {sourceLabel(t)}
                          {t.fixed_expense_id !== null ? ' · Fijo' : ''}
                        </p>
                      </div>
                      <span style={styles.txnAmount}>{formatMoney(t.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export default CategoryTransactionsSheet;
