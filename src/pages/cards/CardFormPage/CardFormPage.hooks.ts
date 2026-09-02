import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createCardThunk, fetchCardDetailThunk, updateCardThunk } from '../../../store/slices/cardsSlice';
import { createAccountThunk } from '../../../store/slices/accountsSlice';
import { previewCycleBounds } from '../../../utils/cycleHelpers';
import { CARD_COLORS } from './CardFormPage.styles';
import type { CardFormPageTypes, CardKind } from './CardFormPage.types';

export const useCardFormPage = (): CardFormPageTypes => {
  const navigate = useNavigate();
  const { cardId: cardIdParam } = useParams();
  const isEdit = cardIdParam !== undefined;
  const cardId = isEdit ? Number(cardIdParam) : null;

  const dispatch = useAppDispatch();
  const cardsError = useAppSelector((s) => s.cards.error);
  const accountsError = useAppSelector((s) => s.accounts.error);
  const existingCard = useAppSelector((s) => (cardId !== null ? s.cards.detailById[cardId] : undefined));

  const [kind, setKind] = useState<CardKind>('CREDIT');
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [statementDay, setStatementDay] = useState('15');
  const [paymentTermDays, setPaymentTermDays] = useState('20');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [hasExistingDebt, setHasExistingDebt] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');
  const [initialDueDate, setInitialDueDate] = useState('');
  const [debitBalance, setDebitBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && cardId !== null) dispatch(fetchCardDetailThunk(cardId));
  }, [isEdit, cardId, dispatch]);

  useEffect(() => {
    if (isEdit && existingCard) {
      setKind('CREDIT');
      setName(existingCard.name);
      setBank(existingCard.bank);
      setLastFour(existingCard.last_four);
      setCreditLimit(existingCard.credit_limit);
      setStatementDay(String(existingCard.statement_day));
      setPaymentTermDays(String(existingCard.payment_term_days));
      setColor(existingCard.color ?? CARD_COLORS[0]);
    }
  }, [isEdit, existingCard]);

  const preview = useMemo(() => {
    const sd = Number(statementDay);
    const term = Number(paymentTermDays);
    if (!sd || !term) return null;
    return previewCycleBounds(sd, term, new Date());
  }, [statementDay, paymentTermDays]);

  const canSaveCredit = Boolean(name.trim() && bank.trim() && lastFour.length === 4 && Number(statementDay) >= 1 && Number(statementDay) <= 31);
  const canSaveDebit = Boolean(name.trim() && bank.trim());
  const canSave = kind === 'CREDIT' ? canSaveCredit : canSaveDebit;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isEdit && cardId !== null) {
        await dispatch(
          updateCardThunk({
            id: cardId,
            payload: {
              name: name.trim(),
              bank: bank.trim(),
              credit_limit: creditLimit || '0',
              statement_day: Number(statementDay),
              payment_term_days: Number(paymentTermDays),
              color,
            },
          })
        ).unwrap();
        navigate(`/tarjetas/${cardId}`);
      } else if (kind === 'CREDIT') {
        await dispatch(
          createCardThunk({
            name: name.trim(),
            bank: bank.trim(),
            last_four: lastFour,
            credit_limit: creditLimit || '0',
            statement_day: Number(statementDay),
            payment_term_days: Number(paymentTermDays),
            color,
            ...(hasExistingDebt && initialBalance && initialDueDate
              ? { initial_balance: initialBalance, initial_due_date: initialDueDate }
              : {}),
          })
        ).unwrap();
        navigate(-1);
      } else {
        await dispatch(
          createAccountThunk({ name: name.trim(), type: 'DEBIT', bank: bank.trim(), balance: debitBalance || '0' })
        ).unwrap();
        navigate(-1);
      }
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  return {
    navigate,
    isEdit,
    cardId,
    kind,
    name,
    bank,
    lastFour,
    creditLimit,
    statementDay,
    paymentTermDays,
    color,
    hasExistingDebt,
    initialBalance,
    initialDueDate,
    debitBalance,
    saving,
    cardsError,
    accountsError,
    preview,
    canSave,
    setKind,
    setName,
    setBank,
    setLastFour,
    setCreditLimit,
    setStatementDay,
    setPaymentTermDays,
    setColor,
    setHasExistingDebt,
    setInitialBalance,
    setInitialDueDate,
    setDebitBalance,
    handleSave,
  };
};
