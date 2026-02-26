import { createFileRoute } from '@tanstack/react-router'
import {
  savingsRecommendationsQueryOptions,
  investmentRecommendationsQueryOptions,
  budgetAdjustmentQueryOptions,
} from '../queries/useRecommendations'

export const Route = createFileRoute('/recommendations')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(savingsRecommendationsQueryOptions),
      queryClient.ensureQueryData(investmentRecommendationsQueryOptions),
      queryClient.ensureQueryData(budgetAdjustmentQueryOptions('all')),
    ]),
})
