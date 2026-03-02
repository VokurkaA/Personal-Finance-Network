import type { TransactionFilters } from '../types/api'

export const categoryKeys = {
  all: ['categories'] as const,
}

export const accountKeys = {
  all: ['accounts'] as const,
  detail: (id: string) => ['accounts', id] as const,
}

export const cardKeys = {
  all: ['cards'] as const,
}

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
  detail: (id: string) => ['transactions', id] as const,
}

export const analyticsKeys = {
  cashflow: (month: string) => ['analytics', 'cashflow', month] as const,
  breakdown: (month: string) => ['analytics', 'cashflow-breakdown', month] as const,
  spendingByCategory: (months: number) => ['analytics', 'spending-by-category', months] as const,
  anomalies: (threshold: number) => ['analytics', 'anomalies', threshold] as const,
  spendingFlow: (month: string) => ['analytics', 'spending-flow', month] as const,
  accountFlow: (accountId: string) => ['analytics', 'account-flow', accountId] as const,
  yearInReview: (year: number) => ['analytics', 'year-in-review', year] as const,
  spendingPatterns: (months: number) => ['analytics', 'spending-patterns', months] as const,
}

export const goalKeys = {
  all: ['goals'] as const,
  detail: (id: string) => ['goals', id] as const,
  contributions: (id: string) => ['goals', id, 'contributions'] as const,
  forecast: (id: string) => ['goals', id, 'forecast'] as const,
}

export const budgetKeys = {
  all: ['budgets'] as const,
  detail: (id: string) => ['budgets', id] as const,
  vsActual: (id: string, category: string) => ['budgets', id, 'vs-actual', category] as const,
}

export const recommendationKeys = {
  savings: ['recommendations', 'savings'] as const,
  investment: ['recommendations', 'investment'] as const,
  adjustment: (category?: string) =>
    ['recommendations', 'budget-adjustment', category ?? 'all'] as const,
}
