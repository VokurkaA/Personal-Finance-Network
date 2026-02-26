import { useQuery, queryOptions } from '@tanstack/react-query'
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

export const cashflowQueryOptions = (month: string) =>
  queryOptions({
    queryKey: analyticsKeys.cashflow(month),
    queryFn: () => getCashflow(month),
    enabled: Boolean(month),
  })

export const cashflowBreakdownQueryOptions = (month: string) =>
  queryOptions({
    queryKey: analyticsKeys.breakdown(month),
    queryFn: () => getCashflowBreakdown(month),
    enabled: Boolean(month),
  })

export const spendingByCategoryQueryOptions = (months: number) =>
  queryOptions({
    queryKey: analyticsKeys.spendingByCategory(months),
    queryFn: () => getSpendingByCategory(months),
  })

export const anomaliesQueryOptions = (threshold = 0.9) =>
  queryOptions({
    queryKey: analyticsKeys.anomalies(threshold),
    queryFn: () => getAnomalies(threshold),
  })

export const spendingFlowQueryOptions = (month: string) =>
  queryOptions({
    queryKey: analyticsKeys.spendingFlow(month),
    queryFn: () => getSpendingFlow(month),
    enabled: Boolean(month),
  })

export const accountFlowQueryOptions = (accountId: string) =>
  queryOptions({
    queryKey: analyticsKeys.accountFlow(accountId),
    queryFn: () => getAccountFlow(accountId),
    enabled: Boolean(accountId),
  })

export const yearInReviewQueryOptions = (year: number) =>
  queryOptions({
    queryKey: analyticsKeys.yearInReview(year),
    queryFn: () => getYearInReview(year),
    enabled: Boolean(year),
  })

export const spendingPatternsQueryOptions = (months: number) =>
  queryOptions({
    queryKey: analyticsKeys.spendingPatterns(months),
    queryFn: () => getSpendingPatterns(months),
  })

export function useCashflow(month: string) {
  return useQuery(cashflowQueryOptions(month))
}

export function useCashflowBreakdown(month: string) {
  return useQuery(cashflowBreakdownQueryOptions(month))
}

export function useSpendingByCategory(months: number) {
  return useQuery(spendingByCategoryQueryOptions(months))
}

export function useAnomalies(threshold = 0.9) {
  return useQuery(anomaliesQueryOptions(threshold))
}

export function useSpendingFlow(month: string) {
  return useQuery(spendingFlowQueryOptions(month))
}

export function useAccountFlow(accountId: string) {
  return useQuery(accountFlowQueryOptions(accountId))
}

export function useYearInReview(year: number) {
  return useQuery(yearInReviewQueryOptions(year))
}

export function useSpendingPatterns(months: number) {
  return useQuery(spendingPatternsQueryOptions(months))
}
