import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { formatShort, parseISODate, todayISO } from "../../utils/dateHelpers";
import { fetchAccountsThunk } from "../../store/slices/accountsSlice";
import { fetchCardsThunk } from "../../store/slices/cardsSlice";
import { createCategoryThunk, fetchCategoriesThunk } from "../../store/slices/categoriesSlice";
import { previewCycleBounds } from "../../utils/cycleHelpers";
import { createTransactionThunk } from "../../store/slices/transactionsSlice";
import { pushToast } from "../../notifications/toastBus";
import { useNavigate } from "react-router-dom";
import { formatMoney } from "../../utils/currency";
import type { AddExpensePageTypes } from "./AddExpensePage.types";
type MethodSelection = { kind: 'account'; id: number } | { kind: 'card'; id: number } | null;

export const useAddExpensePage = (): AddExpensePageTypes => {

    const dispatch = useAppDispatch();
    const accounts = useAppSelector((s) => s.accounts.items);
    const cards = useAppSelector((s) => s.cards.items);
    const categories = useAppSelector((s) => s.categories.items);
    const error = useAppSelector((s) => s.transactions.error);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [method, setMethod] = useState<MethodSelection>(null);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isMsi, setIsMsi] = useState(false);
    const [months, setMonths] = useState('3');
    const [saving, setSaving] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [customDate, setCustomDate] = useState(todayISO());
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchAccountsThunk());
        dispatch(fetchCardsThunk());
        dispatch(fetchCategoriesThunk());
    }, [dispatch]);

    useEffect(() => {
        if (!method && accounts.length > 0) setMethod({ kind: 'account', id: accounts[0].id });
    }, [accounts, method]);

    const selectedCard = method?.kind === 'card' ? cards.find((c) => c.id === method.id) : undefined;
    const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

    const preview = useMemo(() => {
        if (!selectedCard || customDate.length !== 10) return null;
        return previewCycleBounds(selectedCard.statement_day, selectedCard.payment_term_days, parseISODate(customDate));
    }, [selectedCard, customDate]);

    const canSave = Number(amount) > 0 && method !== null && description.trim().length > 0 && customDate.length === 10;

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const created = await dispatch(createCategoryThunk({ name: newCategoryName.trim() })).unwrap();
        setCategoryId(created.id);
        setNewCategoryName('');
    };

    const handleSave = async () => {
        if (!canSave || !method) return;
        setSaving(true);
        try {
            await dispatch(
                createTransactionThunk({
                    amount,
                    category_id: categoryId ?? undefined,
                    description: description.trim(),
                    transaction_date: customDate,
                    payment_method: method.kind === 'card' ? 'CREDIT' : 'DEBIT',
                    account_id: method.kind === 'account' ? method.id : undefined,
                    credit_card_id: method.kind === 'card' ? method.id : undefined,
                    installment_months: method.kind === 'card' && isMsi ? Number(months) : undefined,
                })
            ).unwrap();
            pushToast({ kind: 'success', title: 'Compra registrada', message: `${formatMoney(amount)} · ${formatShort(customDate)}` });
            navigate(-1);
        } catch {
            // el error ya se muestra desde el slice
        } finally {
            setSaving(false);
        }
    };

    return {
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
        setSaving,
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
        error,

    }


}