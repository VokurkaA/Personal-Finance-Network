import { createFileRoute } from '@tanstack/react-router'
import { budgetsQueryOptions } from '../queries/useBudget'

export const Route = createFileRoute('/budget')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(budgetsQueryOptions),
})
