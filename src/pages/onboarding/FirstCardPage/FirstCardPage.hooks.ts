import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createCardThunk } from '../../../store/slices/cardsSlice';
import { previewCycleBounds } from '../../../utils/cycleHelpers';
import { CARD_COLORS } from './FirstCardPage.styles';
import type { FirstCardPageTypes } from './FirstCardPage.types';

export const useFirstCardPage = (): FirstCardPageTypes => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.cards);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [statementDay, setStatementDay] = useState('15');
  const [paymentTermDays, setPaymentTermDays] = useState('20');
  const [color, setColor] = useState(CARD_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    const sd = Number(statementDay);
    const term = Number(paymentTermDays);
    if (!sd || !term) return null;
    return previewCycleBounds(sd, term, new Date());
  }, [statementDay, paymentTermDays]);

  const canSave = Boolean(
    name.trim() && bank.trim() && lastFour.length === 4 && Number(statementDay) >= 1 && Number(statementDay) <= 31
  );

  const handleNext = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await dispatch(
        createCardThunk({
          name: name.trim(),
          bank: bank.trim(),
          last_four: lastFour,
          credit_limit: creditLimit || '0',
          statement_day: Number(statementDay),
          payment_term_days: Number(paymentTermDays),
          color,
        })
      ).unwrap();
      navigate('/onboarding/ingreso');
    } catch {
      // el error ya se muestra desde el slice
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/ingreso');
  };

  return {
    navigate,
    name,
    bank,
    lastFour,
    creditLimit,
    statementDay,
    paymentTermDays,
    color,
    saving,
    error,
    preview,
    canSave,
    setName,
    setBank,
    setLastFour,
    setCreditLimit,
    setStatementDay,
    setPaymentTermDays,
    setColor,
    handleNext,
    handleSkip,
  };
};
