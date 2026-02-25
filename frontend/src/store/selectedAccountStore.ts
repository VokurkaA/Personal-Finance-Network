import { Store } from '@tanstack/store'

interface SelectedAccountState {
  accountId: string | null
}

export const selectedAccountStore = new Store<SelectedAccountState>({
  accountId: null,
})

export function selectAccount(accountId: string | null): void {
  selectedAccountStore.setState(() => ({ accountId }))
}
