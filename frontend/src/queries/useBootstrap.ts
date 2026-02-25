import { useAccounts } from './useAccounts'
import { useCards } from './useCards'
import { useTransactions } from './useTransactions'
import { useBudgets } from './useBudget'
import { useGoals } from './useGoals'
import {
  useSavingsRecommendations,
  useInvestmentRecommendations,
  useBudgetAdjustment,
} from './useRecommendations'
import {
  useCashflow,
  useCashflowBreakdown,
  useSpendingByCategory,
  useAnomalies,
  useSpendingFlow,
  useSpendingPatterns,
  useYearInReview,
} from './useAnalytics'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function currentYear() {
  return new Date().getFullYear()
}

/**
 * Triggers all initial data fetches at app startup.
 * Results are written into TanStack stores via useEffect in each hook.
 * With staleTime: Infinity, subsequent hook calls (on route navigation) are no-ops.
 */
export function useBootstrap() {
  const month = currentMonth()
  const year = currentYear()

  useAccounts()
  useCards()
  useBudgets()
  useGoals()
  useTransactions({})

  useSavingsRecommendations()
  useInvestmentRecommendations()
  useBudgetAdjustment()

  useCashflow(month)
  useCashflowBreakdown(month)
  useSpendingByCategory(3)
  useAnomalies(0.9)
  useSpendingFlow(month)
  useSpendingPatterns(3)
  useYearInReview(year)
}
