import { createFileRoute } from '@tanstack/react-router'
import { budgetsQueryOptions } from '../queries/useBudget'
import { cashflowQueryOptions } from '../queries/useAnalytics'
import { goalsQueryOptions } from '../queries/useGoals'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) => {
    const month = currentMonth()
    return Promise.all([
      queryClient.ensureQueryData(cashflowQueryOptions(month)),
      queryClient.ensureQueryData(goalsQueryOptions),
      queryClient.ensureQueryData(budgetsQueryOptions),
    ])
  },
})
