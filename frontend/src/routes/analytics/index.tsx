import { createFileRoute } from '@tanstack/react-router'
import {
  spendingFlowQueryOptions,
  anomaliesQueryOptions,
  spendingPatternsQueryOptions,
} from '../../queries/useAnalytics'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export const Route = createFileRoute('/analytics/')({
  loader: ({ context: { queryClient } }) => {
    const month = currentMonth()
    return Promise.all([
      queryClient.ensureQueryData(spendingFlowQueryOptions(month)),
      queryClient.ensureQueryData(anomaliesQueryOptions(0.9)),
      queryClient.ensureQueryData(spendingPatternsQueryOptions(3)),
    ])
  },
})
