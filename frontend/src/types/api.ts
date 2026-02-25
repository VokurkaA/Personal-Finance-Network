import type { Transaction } from './entities'
import type { TrendDirection, RiskProfile, Priority, FlowNodeType } from './common'

// ─── Query Params ────────────────────────────────────────────────────────────

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  category?: string
  accountId?: string
}

export interface CashflowParams {
  month: string // YYYY-MM
}

export interface SpendingByCategoryParams {
  months: number
}

export interface AnomalyParams {
  threshold?: number // 0–1.0, default 0.9
}

export interface SpendingFlowParams {
  month: string // YYYY-MM
}

export interface YearInReviewParams {
  year: number
}

export interface SpendingPatternsParams {
  months: number
}

// ─── Cashflow ────────────────────────────────────────────────────────────────

export interface CashflowIncome {
  source: string
  amount: number
  account: string
}

export interface CashflowExpense {
  category: string
  amount: number
  percentage: number
}

export interface CashflowResponse {
  month: string
  income: CashflowIncome[]
  totalIncome: number
  expenses: CashflowExpense[]
  totalExpenses: number
  netCashflow: number
  savingsRate: number
  accountBalanceChange: {
    from: number
    to: number
  }
}

// ─── Cashflow Breakdown ───────────────────────────────────────────────────────

export interface CashflowBreakdownItem {
  category: string
  amount: number
  percentage: number
  subcategories: CashflowBreakdownItem[]
}

// ─── Spending By Category ─────────────────────────────────────────────────────

export interface SpendingByCategoryItem {
  category: string
  thisMonth: number
  lastMonth: number
  trend: TrendDirection
}

// ─── Anomalies ────────────────────────────────────────────────────────────────

export interface AnomalyItem {
  transactionId: string
  date: string
  amount: number
  merchant: string
  category: string
  anomalyScore: number
  reason: string
  location?: string
  timePattern?: string
  recommendation?: string
}

export interface AnomalyResponse {
  anomalies: AnomalyItem[]
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export interface GoalForecast {
  estimatedDate: string
  requiredMonthlyAmount: number
}

export interface GoalContribution {
  transaction: Transaction
  contributedAt: string
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetVsActualItem {
  category: string
  planned: number
  actual: number
  remaining: number
  percentageUsed: number
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface SavingsService {
  name: string
  amount: number
}

export interface SavingsRecommendation {
  title: string
  currentSpending: number
  services?: SavingsService[]
  frequency?: string
  averagePrice?: number
  suggestion: string
  potentialSavings: number
  priority: Priority
}

export interface SavingsResponse {
  recommendations: SavingsRecommendation[]
  totalPotentialSavings: number
}

export interface InvestmentRecommendation {
  asset: string
  expectedReturn: number
  risk: RiskProfile
  reason: string
}

export interface BudgetAdjustmentSuggestion {
  category: string
  currentBudget: number
  suggestedBudget: number
  reason: string
}

// ─── Network / Spending Flow ──────────────────────────────────────────────────

export interface FlowNode {
  id: string
  type: FlowNodeType
  label: string
}

export interface FlowEdge {
  from: string
  to: string
  amount: number
}

export interface SpendingFlowResponse {
  month?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface AccountFlowResponse {
  inflow: number
  outflow: number
  netFlow: number
}
