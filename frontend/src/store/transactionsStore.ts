import { Store } from '@tanstack/store'
import type { Transaction } from '../types/entities'
import type { StoreStatus } from './types'

interface TransactionsState {
  data: Transaction[]
  status: StoreStatus
}

export const transactionsStore = new Store<TransactionsState>({ data: [], status: 'idle' })

export function setTransactions(data: Transaction[]): void {
  transactionsStore.setState(() => ({ data, status: 'success' }))
}

export function setTransactionsStatus(status: StoreStatus): void {
  transactionsStore.setState((s) => ({ ...s, status }))
}
