import { apiFetch } from './client'
import type {
  SavingsResponse,
  InvestmentRecommendation,
  BudgetAdjustmentSuggestion,
} from '../types/api'

export function getSavingsRecommendations(): Promise<SavingsResponse> {
  return apiFetch<SavingsResponse>('/recommendations/savings')
}

export function getInvestmentRecommendations(): Promise<InvestmentRecommendation[]> {
  return apiFetch<InvestmentRecommendation[]>('/recommendations/investment')
}

export function getBudgetAdjustment(category?: string): Promise<BudgetAdjustmentSuggestion[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ''
  return apiFetch<BudgetAdjustmentSuggestion[]>(`/recommendations/budget-adjustment${qs}`)
}
