import { apiFetch } from './client'
import type { Transaction } from '../types/entities'
import type { TransactionFilters } from '../types/api'

function buildQuery(filters: TransactionFilters): string {
  const params = new URLSearchParams()
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.category) params.set('category', filters.category)
  if (filters.accountId) params.set('accountId', filters.accountId)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  return apiFetch<Transaction[]>(`/transactions${buildQuery(filters)}`)
}

export function getTransaction(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`)
}

export function createTransaction(body: Omit<Transaction, 'id'>): Promise<Transaction> {
  return apiFetch<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function importTransactions(formData: FormData): Promise<{ imported: number }> {
  return apiFetch<{ imported: number }>('/transactions/import', {
    method: 'POST',
    // Do NOT set Content-Type here — browser sets multipart boundary automatically
    headers: {},
    body: formData,
  })
}
