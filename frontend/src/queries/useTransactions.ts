import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  importTransactions,
} from '../api/transactions'
import { transactionKeys } from './keys'
import type { Transaction } from '../types/entities'
import type { TransactionFilters } from '../types/api'

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: Boolean(id),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Transaction, 'id'>) => createTransaction(body),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

export function useImportTransactions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => importTransactions(formData),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}
