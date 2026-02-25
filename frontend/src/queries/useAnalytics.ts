import { useQuery } from '@tanstack/react-query'
import {
  getCashflow,
  getCashflowBreakdown,
  getSpendingByCategory,
  getAnomalies,
  getSpendingFlow,
  getAccountFlow,
  getYearInReview,
  getSpendingPatterns,
} from '../api/analytics'
import { analyticsKeys } from './keys'

export function useCashflow(month: string) {
  return useQuery({
    queryKey: analyticsKeys.cashflow(month),
    queryFn: () => getCashflow(month),
    enabled: Boolean(month),
  })
}

export function useCashflowBreakdown(month: string) {
  return useQuery({
    queryKey: analyticsKeys.breakdown(month),
    queryFn: () => getCashflowBreakdown(month),
    enabled: Boolean(month),
  })
}

export function useSpendingByCategory(months: number) {
  return useQuery({
    queryKey: analyticsKeys.spendingByCategory(months),
    queryFn: () => getSpendingByCategory(months),
  })
}

export function useAnomalies(threshold = 0.9) {
  return useQuery({
    queryKey: analyticsKeys.anomalies(threshold),
    queryFn: () => getAnomalies(threshold),
  })
}

export function useSpendingFlow(month: string) {
  return useQuery({
    queryKey: analyticsKeys.spendingFlow(month),
    queryFn: () => getSpendingFlow(month),
    enabled: Boolean(month),
  })
}

export function useAccountFlow(accountId: string) {
  return useQuery({
    queryKey: analyticsKeys.accountFlow(accountId),
    queryFn: () => getAccountFlow(accountId),
    enabled: Boolean(accountId),
  })
}

export function useYearInReview(year: number) {
  return useQuery({
    queryKey: analyticsKeys.yearInReview(year),
    queryFn: () => getYearInReview(year),
    enabled: Boolean(year),
  })
}

export function useSpendingPatterns(months: number) {
  return useQuery({
    queryKey: analyticsKeys.spendingPatterns(months),
    queryFn: () => getSpendingPatterns(months),
  })
}
