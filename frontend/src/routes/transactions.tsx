import { createFileRoute } from '@tanstack/react-router'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { transactionsQueryOptions } from '../queries/useTransactions'

export const Route = createFileRoute('/transactions')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(transactionsQueryOptions({})),
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <TransactionFilters />
      <TransactionTable />
    </div>
  )
}
