// Tipos espejo de los schemas Pydantic del backend (backend-movile/app/schemas).
// El frontend NO recalcula nada de dominio — solo consume estas formas.

export type AccountType = 'CASH' | 'DEBIT';
export type CycleStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'PARTIALLY_PAID';
export type PaymentMethod = 'CASH' | 'DEBIT' | 'CREDIT';
export type PaymentSourceType = 'ACCOUNT' | 'ALLOCATION';
export type IncomeFrequency = 'BIWEEKLY' | 'MONTHLY' | 'VARIABLE';
export const LAST_DAY = 'LAST_DAY';
// Además de un día 1-31 o LAST_DAY, admite "semana de pago" tipo "W3-FRI" /
// "WLAST-FRI" (el N-ésimo o el último día-de-la-semana del mes) — ver
// utils/paymentDay.ts para construir/leer ese formato.
export type PaymentDay = number | string;

export interface User {
  id: number;
  email: string;
  currency: string;
  timezone: string;
  monthly_spending_goal: string | null;
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  bank: string | null;
  balance: string; // Decimal serializado como string
  color: string | null;
}

export interface BillingCycle {
  id: number;
  start_date: string;
  end_date: string;
  due_date: string;
  status: CycleStatus;
  total_amount: string;
  paid_amount: string;
}

export interface InstallmentPlan {
  id: number;
  description: string;
  total_amount: string;
  months_total: number;
  months_paid: number;
  monthly_amount: string;
  start_date: string;
}

export interface CreditCard {
  id: number;
  name: string;
  bank: string;
  last_four: string;
  credit_limit: string;
  statement_day: number;
  payment_term_days: number;
  color: string | null;
}

export interface CreditCardDetail extends CreditCard {
  current_cycle: BillingCycle | null;
  pending_cycle: BillingCycle | null;
  allocated_for_pending_cycle: string;
  installment_plans: InstallmentPlan[];
  last_paid_cycle: BillingCycle | null;
  available_credit: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string | null;
  color?: string | null;
  monthly_limit?: string | null;
}

export interface Transaction {
  id: number;
  amount: string;
  category_id: number | null;
  description: string | null;
  transaction_date: string;
  cash_flow_date: string;
  payment_method: PaymentMethod;
  account_id: number | null;
  credit_card_id: number | null;
  billing_cycle_id: number | null;
  fixed_expense_id: number | null;
}

export interface Payment {
  id: number;
  billing_cycle_id: number;
  amount: string;
  payment_date: string;
  source_type: PaymentSourceType;
  source_account_id: number | null;
}

export interface SavingsAllocation {
  id: number;
  billing_cycle_id: number;
  amount: string;
  source_account_id: number;
}

// ---- Agregados -------------------------------------------------------------

export interface UpcomingOutflow {
  date: string;
  kind: string;
  label: string;
  amount: string;
}

export interface DashboardCardSummary {
  id: number;
  name: string;
  current_cycle: BillingCycle | null;
  pending_cycle: BillingCycle | null;
}

export interface DashboardResponse {
  available: string;
  accounts_total: string;
  committed: string;
  pending_fixed: string;
  next_income_date: string | null;
  upcoming_outflows: UpcomingOutflow[];
  cards: DashboardCardSummary[];
}

export interface FlowEvent {
  date: string;
  kind: string;
  label: string;
  amount: string | null;
  reference_id: number | null;
}

export interface FlowWeekBucket {
  week_index: number;
  start: string;
  end: string;
  events: FlowEvent[];
}

export interface FlowResponse {
  as_of: string;
  until: string;
  starting_balance: string;
  ending_balance: string;
  deficit_risk: boolean;
  deficit_date: string | null;
  weeks: FlowWeekBucket[];
}

export interface CategoryBudget {
  category_id: number;
  category_name: string;
  monthly_limit: string | null;
  spent: string;
  credit_spent: string;
  credit_pending: string;
}

export interface BudgetResponse {
  month: string;
  categories: CategoryBudget[];
  total_spent: string;
  spending_goal: string | null;
  income_this_month: string;
  projected_savings: string;
}
