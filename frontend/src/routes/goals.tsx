import { createFileRoute } from '@tanstack/react-router'
import { goalsQueryOptions } from '../queries/useGoals'

export const Route = createFileRoute('/goals')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(goalsQueryOptions),
})
