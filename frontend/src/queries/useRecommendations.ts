import { useQuery, queryOptions } from '@tanstack/react-query'
import {
  getSavingsRecommendations,
  getInvestmentRecommendations,
  getBudgetAdjustment,
} from '../api/recommendations'
import { recommendationKeys } from './keys'

export const savingsRecommendationsQueryOptions = queryOptions({
  queryKey: recommendationKeys.savings,
  queryFn: getSavingsRecommendations,
})

export const investmentRecommendationsQueryOptions = queryOptions({
  queryKey: recommendationKeys.investment,
  queryFn: getInvestmentRecommendations,
})

export const budgetAdjustmentQueryOptions = (category?: string) =>
  queryOptions({
    queryKey: recommendationKeys.adjustment(category),
    queryFn: () => getBudgetAdjustment(category),
  })

export function useSavingsRecommendations() {
  return useQuery(savingsRecommendationsQueryOptions)
}

export function useInvestmentRecommendations() {
  return useQuery(investmentRecommendationsQueryOptions)
}

export function useBudgetAdjustment(category?: string) {
  return useQuery(budgetAdjustmentQueryOptions(category))
}
