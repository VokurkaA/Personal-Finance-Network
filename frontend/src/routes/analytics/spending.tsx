import { createFileRoute } from '@tanstack/react-router'
import { spendingByCategoryQueryOptions } from '../../queries/useAnalytics'
import { budgetsQueryOptions } from '../../queries/useBudget'

export const Route = createFileRoute('/analytics/spending')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(spendingByCategoryQueryOptions(1)),
      queryClient.ensureQueryData(budgetsQueryOptions),
    ]),
})
