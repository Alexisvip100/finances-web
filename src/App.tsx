import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from './store';
import { bootstrapAuth } from './store/slices/authSlice';
import { fetchAccountsThunk } from './store/slices/accountsSlice';
import { colors } from './theme/theme';
import { Push, Sheet } from './components/PageTransition';

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
          border: `3px solid ${colors.divider}`,
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
  const location = useLocation();
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
      <AnimatePresence mode="popLayout" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding/concepto" element={<ConceptPage />} />
          <Route path="/onboarding/cuentas" element={<Push><OnboardingAccountsPage /></Push>} />
          <Route path="/onboarding/primera-tarjeta" element={<Push><FirstCardPage /></Push>} />
          <Route path="/onboarding/ingreso" element={<Push><OnboardingIncomePage /></Push>} />
          <Route path="*" element={<Navigate to="/onboarding/concepto" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/flujo" element={<FlowPage />} />
          <Route path="/presupuesto" element={<BudgetPage />} />
          <Route path="/tarjetas" element={<CardsListPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
        </Route>

        <Route path="/tarjetas/nueva" element={<Sheet><CardFormPage /></Sheet>} />
        <Route path="/tarjetas/:cardId/editar" element={<Sheet><CardFormPage /></Sheet>} />
        <Route path="/tarjetas/:cardId" element={<Push><CardDetailPage /></Push>} />
        <Route path="/tarjetas/:cardId/pagar" element={<Sheet><RegisterPaymentPage /></Sheet>} />
        <Route path="/tarjetas/:cardId/apartar" element={<Sheet><AllocatePage /></Sheet>} />

        <Route path="/ajustes/categorias" element={<Push><CategoriesPage /></Push>} />
        <Route path="/ajustes/cuentas/nueva" element={<Sheet><AccountFormPage /></Sheet>} />
        <Route path="/ajustes/cuentas/:accountId" element={<Sheet><AccountFormPage /></Sheet>} />
        <Route path="/ajustes/ingresos/nuevo" element={<Sheet><IncomeFormPage /></Sheet>} />
        <Route path="/ajustes/ingresos/:incomeId" element={<Sheet><IncomeFormPage /></Sheet>} />
        <Route path="/ajustes/gastos-fijos/nuevo" element={<Sheet><FixedExpenseFormPage /></Sheet>} />
        <Route path="/ajustes/gastos-fijos/:fixedExpenseId" element={<Sheet><FixedExpenseFormPage /></Sheet>} />
        <Route path="/ajustes/historial-gastos" element={<Push><TransactionHistoryPage /></Push>} />
        <Route path="/ajustes/historial-ingresos" element={<Push><IncomeHistoryPage /></Push>} />

        <Route path="/gastos/nuevo" element={<Sheet><AddExpensePage /></Sheet>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
