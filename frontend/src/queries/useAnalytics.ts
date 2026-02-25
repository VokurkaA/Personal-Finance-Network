import { useEffect } from 'react'
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
import {
  setCashflow,
  setCashflowBreakdown,
  setSpendingByCategory,
  setAnomalies,
  setSpendingFlow,
  setAccountFlow,
  setYearInReview,
  setSpendingPatterns,
} from '../store/analyticsStore'

export function useCashflow(month: string) {
  const query = useQuery({
    queryKey: analyticsKeys.cashflow(month),
    queryFn: () => getCashflow(month),
    enabled: Boolean(month),
  })

  useEffect(() => {
    if (query.data && month) setCashflow(month, query.data)
  }, [month, query.data])

  return query
}

export function useCashflowBreakdown(month: string) {
  const query = useQuery({
    queryKey: analyticsKeys.breakdown(month),
    queryFn: () => getCashflowBreakdown(month),
    enabled: Boolean(month),
  })

  useEffect(() => {
    if (query.data && month) setCashflowBreakdown(month, query.data)
  }, [month, query.data])

  return query
}

export function useSpendingByCategory(months: number) {
  const query = useQuery({
    queryKey: analyticsKeys.spendingByCategory(months),
    queryFn: () => getSpendingByCategory(months),
  })

  useEffect(() => {
    if (query.data) setSpendingByCategory(months, query.data)
  }, [months, query.data])

  return query
}

export function useAnomalies(threshold = 0.9) {
  const query = useQuery({
    queryKey: analyticsKeys.anomalies(threshold),
    queryFn: () => getAnomalies(threshold),
  })

  useEffect(() => {
    if (query.data) setAnomalies(threshold, query.data)
  }, [threshold, query.data])

  return query
}

export function useSpendingFlow(month: string) {
  const query = useQuery({
    queryKey: analyticsKeys.spendingFlow(month),
    queryFn: () => getSpendingFlow(month),
    enabled: Boolean(month),
  })

  useEffect(() => {
    if (query.data && month) setSpendingFlow(month, query.data)
  }, [month, query.data])

  return query
}

export function useAccountFlow(accountId: string) {
  const query = useQuery({
    queryKey: analyticsKeys.accountFlow(accountId),
    queryFn: () => getAccountFlow(accountId),
    enabled: Boolean(accountId),
  })

  useEffect(() => {
    if (query.data && accountId) setAccountFlow(accountId, query.data)
  }, [accountId, query.data])

  return query
}

export function useYearInReview(year: number) {
  const query = useQuery({
    queryKey: analyticsKeys.yearInReview(year),
    queryFn: () => getYearInReview(year),
    enabled: Boolean(year),
  })

  useEffect(() => {
    if (query.data) setYearInReview(year, query.data)
  }, [year, query.data])

  return query
}

export function useSpendingPatterns(months: number) {
  const query = useQuery({
    queryKey: analyticsKeys.spendingPatterns(months),
    queryFn: () => getSpendingPatterns(months),
  })

  useEffect(() => {
    if (query.data) setSpendingPatterns(months, query.data)
  }, [months, query.data])

  return query
}
