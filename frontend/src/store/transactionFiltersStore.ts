import { Store } from '@tanstack/store'
import type { TransactionFilters } from '../types/api'

export const transactionFiltersStore = new Store<TransactionFilters>({
  startDate: undefined,
  endDate: undefined,
  category: undefined,
  accountId: undefined,
  search: undefined,
})

export function setTransactionFilter<K extends keyof TransactionFilters>(
  key: K,
  value: TransactionFilters[K],
): void {
  transactionFiltersStore.setState((prev) => ({ ...prev, [key]: value }))
}

export function resetTransactionFilters(): void {
  transactionFiltersStore.setState(() => ({
    startDate: undefined,
    endDate: undefined,
    category: undefined,
    accountId: undefined,
    search: undefined,
  }))
}
