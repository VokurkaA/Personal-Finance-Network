import { createFileRoute } from '@tanstack/react-router'
import { transactionsQueryOptions } from '../queries/useTransactions'

export const Route = createFileRoute('/transactions')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(transactionsQueryOptions({})),
})
