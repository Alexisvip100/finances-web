import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import cardsReducer from './slices/cardsSlice';
import transactionsReducer from './slices/transactionsSlice';
import categoriesReducer from './slices/categoriesSlice';
import fixedExpensesReducer from './slices/fixedExpensesSlice';
import incomesReducer from './slices/incomesSlice';
import dashboardReducer from './slices/dashboardSlice';
import flowReducer from './slices/flowSlice';
import budgetReducer from './slices/budgetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    cards: cardsReducer,
    transactions: transactionsReducer,
    categories: categoriesReducer,
    fixedExpenses: fixedExpensesReducer,
    incomes: incomesReducer,
    dashboard: dashboardReducer,
    flow: flowReducer,
    budget: budgetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
