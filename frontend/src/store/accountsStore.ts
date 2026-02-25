import { Store } from '@tanstack/store'
import type { Account } from '../types/entities'
import type { StoreStatus } from './types'

interface AccountsState {
  data: Account[]
  status: StoreStatus
}

export const accountsStore = new Store<AccountsState>({ data: [], status: 'idle' })

export function setAccounts(data: Account[]): void {
  accountsStore.setState(() => ({ data, status: 'success' }))
}

export function setAccountsStatus(status: StoreStatus): void {
  accountsStore.setState((s) => ({ ...s, status }))
}
