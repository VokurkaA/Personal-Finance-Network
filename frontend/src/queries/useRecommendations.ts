import { useQuery } from '@tanstack/react-query'
import {
  getSavingsRecommendations,
  getInvestmentRecommendations,
  getBudgetAdjustment,
} from '../api/recommendations'
import { recommendationKeys } from './keys'

export function useSavingsRecommendations() {
  return useQuery({
    queryKey: recommendationKeys.savings,
    queryFn: getSavingsRecommendations,
  })
}

export function useInvestmentRecommendations() {
  return useQuery({
    queryKey: recommendationKeys.investment,
    queryFn: getInvestmentRecommendations,
  })
}

export function useBudgetAdjustment(category?: string) {
  return useQuery({
    queryKey: recommendationKeys.adjustment(category),
    queryFn: () => getBudgetAdjustment(category),
  })
}
