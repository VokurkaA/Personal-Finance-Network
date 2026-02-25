import { apiFetch } from './client'
import type {
  CashflowResponse,
  CashflowBreakdownItem,
  SpendingByCategoryItem,
  AnomalyResponse,
  SpendingFlowResponse,
  AccountFlowResponse,
} from '../types/api'

export function getCashflow(month: string): Promise<CashflowResponse> {
  return apiFetch<CashflowResponse>(`/analytics/cashflow?month=${month}`)
}

export function getCashflowBreakdown(month: string): Promise<CashflowBreakdownItem[]> {
  return apiFetch<CashflowBreakdownItem[]>(`/analytics/cashflow-breakdown?month=${month}`)
}

export function getSpendingByCategory(months: number): Promise<SpendingByCategoryItem[]> {
  return apiFetch<SpendingByCategoryItem[]>(`/analytics/spending-by-category?months=${months}`)
}

export function getAnomalies(threshold = 0.9): Promise<AnomalyResponse> {
  return apiFetch<AnomalyResponse>(`/analytics/anomalies?threshold=${threshold}`)
}

export function getSpendingFlow(month: string): Promise<SpendingFlowResponse> {
  return apiFetch<SpendingFlowResponse>(`/analytics/spending-flow?month=${month}`)
}

export function getAccountFlow(accountId: string): Promise<AccountFlowResponse> {
  return apiFetch<AccountFlowResponse>(`/analytics/account-flow?account=${accountId}`)
}

export function getYearInReview(year: number): Promise<unknown> {
  return apiFetch(`/analytics/year-in-review?year=${year}`)
}

export function getSpendingPatterns(months: number): Promise<unknown> {
  return apiFetch(`/analytics/spending-patterns?months=${months}`)
}
