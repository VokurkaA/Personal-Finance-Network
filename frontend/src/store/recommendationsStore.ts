import { Store } from '@tanstack/store'
import type {
  SavingsRecommendation,
  InvestmentRecommendation,
  BudgetAdjustmentSuggestion,
} from '../types/api'
import type { StoreStatus } from './types'

interface RecommendationsState {
  savings: SavingsRecommendation[]
  totalPotentialSavings: number
  savingsStatus: StoreStatus
  investments: InvestmentRecommendation[]
  investmentsStatus: StoreStatus
  budgetAdjustment: Record<string, BudgetAdjustmentSuggestion[]>
}

export const recommendationsStore = new Store<RecommendationsState>({
  savings: [],
  totalPotentialSavings: 0,
  savingsStatus: 'idle',
  investments: [],
  investmentsStatus: 'idle',
  budgetAdjustment: {},
})

export function setSavingsRecommendations(data: SavingsRecommendation[], total: number): void {
  recommendationsStore.setState((s) => ({
    ...s,
    savings: data,
    totalPotentialSavings: total,
    savingsStatus: 'success',
  }))
}

export function setInvestmentRecommendations(data: InvestmentRecommendation[]): void {
  recommendationsStore.setState((s) => ({
    ...s,
    investments: data,
    investmentsStatus: 'success',
  }))
}

export function setBudgetAdjustment(category: string, data: BudgetAdjustmentSuggestion[]): void {
  recommendationsStore.setState((s) => ({
    ...s,
    budgetAdjustment: { ...s.budgetAdjustment, [category]: data },
  }))
}
