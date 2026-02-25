import { createFileRoute } from '@tanstack/react-router'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionTable } from '../components/transactions/TransactionTable'

export const Route = createFileRoute('/transactions')({
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
