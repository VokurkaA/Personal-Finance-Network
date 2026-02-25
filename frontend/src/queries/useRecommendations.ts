import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getSavingsRecommendations,
  getInvestmentRecommendations,
  getBudgetAdjustment,
} from '../api/recommendations'
import { recommendationKeys } from './keys'
import {
  setSavingsRecommendations,
  setInvestmentRecommendations,
  setBudgetAdjustment,
} from '../store/recommendationsStore'

export function useSavingsRecommendations() {
  const query = useQuery({
    queryKey: recommendationKeys.savings,
    queryFn: getSavingsRecommendations,
  })

  useEffect(() => {
    if (query.data) {
      setSavingsRecommendations(query.data.recommendations, query.data.totalPotentialSavings)
    }
  }, [query.data])

  return query
}

export function useInvestmentRecommendations() {
  const query = useQuery({
    queryKey: recommendationKeys.investment,
    queryFn: getInvestmentRecommendations,
  })

  useEffect(() => {
    if (query.data) setInvestmentRecommendations(query.data)
  }, [query.data])

  return query
}

export function useBudgetAdjustment(category?: string) {
  const key = category ?? 'all'
  const query = useQuery({
    queryKey: recommendationKeys.adjustment(category),
    queryFn: () => getBudgetAdjustment(category),
  })

  useEffect(() => {
    if (query.data) setBudgetAdjustment(key, query.data)
  }, [key, query.data])

  return query
}
