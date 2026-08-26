import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { bootstrapAuth } from './store/slices/authSlice';
import { fetchAccountsThunk } from './store/slices/accountsSlice';
import { colors } from './theme/theme';

import AuthPage from './pages/AuthPage';
import AppShell from './layout/AppShell';
import HomePage from './pages/dashboard/HomePage';
import FlowPage from './pages/flow/FlowPage';
import BudgetPage from './pages/budget/BudgetPage';
import CardsListPage from './pages/cards/CardsListPage';
import CardDetailPage from './pages/cards/CardDetailPage';
import CardFormPage from './pages/cards/CardFormPage';
import RegisterPaymentPage from './pages/cards/RegisterPaymentPage';
import AllocatePage from './pages/cards/AllocatePage';
import SettingsPage from './pages/settings/SettingsPage';
import CategoriesPage from './pages/settings/CategoriesPage';
import AccountFormPage from './pages/settings/AccountFormPage';
import IncomeFormPage from './pages/settings/IncomeFormPage';
import FixedExpenseFormPage from './pages/settings/FixedExpenseFormPage';
import TransactionHistoryPage from './pages/settings/TransactionHistoryPage';
import IncomeHistoryPage from './pages/settings/IncomeHistoryPage';
import AddExpensePage from './pages/AddExpensePage';
import ConceptPage from './pages/onboarding/ConceptPage';
import OnboardingAccountsPage from './pages/onboarding/OnboardingAccountsPage';
import FirstCardPage from './pages/onboarding/FirstCardPage';
import OnboardingIncomePage from './pages/onboarding/OnboardingIncomePage';

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
      <span
        style={{
          width: 32,
          height: 32,
          border: `3px solid ${colors.accent}33`,
          borderTopColor: colors.accent,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const { user, bootstrapped } = useAppSelector((s) => s.auth);
  const accounts = useAppSelector((s) => s.accounts);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) dispatch(fetchAccountsThunk());
  }, [dispatch, user]);

  if (!bootstrapped) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  if (accounts.status === 'loading' && accounts.items.length === 0) {
    return <LoadingScreen />;
  }

  const needsOnboarding = accounts.items.length === 0;

  if (needsOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding/concepto" element={<ConceptPage />} />
        <Route path="/onboarding/cuentas" element={<OnboardingAccountsPage />} />
        <Route path="/onboarding/primera-tarjeta" element={<FirstCardPage />} />
        <Route path="/onboarding/ingreso" element={<OnboardingIncomePage />} />
        <Route path="*" element={<Navigate to="/onboarding/concepto" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/flujo" element={<FlowPage />} />
        <Route path="/presupuesto" element={<BudgetPage />} />
        <Route path="/tarjetas" element={<CardsListPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
      </Route>

      <Route path="/tarjetas/nueva" element={<CardFormPage />} />
      <Route path="/tarjetas/:cardId/editar" element={<CardFormPage />} />
      <Route path="/tarjetas/:cardId" element={<CardDetailPage />} />
      <Route path="/tarjetas/:cardId/pagar" element={<RegisterPaymentPage />} />
      <Route path="/tarjetas/:cardId/apartar" element={<AllocatePage />} />

      <Route path="/ajustes/categorias" element={<CategoriesPage />} />
      <Route path="/ajustes/cuentas/nueva" element={<AccountFormPage />} />
      <Route path="/ajustes/cuentas/:accountId" element={<AccountFormPage />} />
      <Route path="/ajustes/ingresos/nuevo" element={<IncomeFormPage />} />
      <Route path="/ajustes/ingresos/:incomeId" element={<IncomeFormPage />} />
      <Route path="/ajustes/gastos-fijos/nuevo" element={<FixedExpenseFormPage />} />
      <Route path="/ajustes/gastos-fijos/:fixedExpenseId" element={<FixedExpenseFormPage />} />
      <Route path="/ajustes/historial-gastos" element={<TransactionHistoryPage />} />
      <Route path="/ajustes/historial-ingresos" element={<IncomeHistoryPage />} />

      <Route path="/gastos/nuevo" element={<AddExpensePage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
