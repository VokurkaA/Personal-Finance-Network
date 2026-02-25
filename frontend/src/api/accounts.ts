import { apiFetch } from './client'
import type { Account } from '../types/entities'

export function getAccounts(): Promise<Account[]> {
  return apiFetch<Account[]>('/accounts')
}

export function createAccount(body: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
  return apiFetch<Account>('/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
