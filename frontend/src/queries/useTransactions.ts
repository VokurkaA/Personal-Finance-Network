import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  importTransactions,
} from '../api/transactions'
import { transactionKeys } from './keys'
import { transactionsStore, setTransactions } from '../store/transactionsStore'
import type { Transaction } from '../types/entities'
import type { TransactionFilters } from '../types/api'

export function useTransactions(filters: TransactionFilters = {}) {
  const query = useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
  })

  useEffect(() => {
    if (query.data) setTransactions(query.data)
  }, [query.data])

  return query
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
    onMutate: (vars) => {
      const snapshot = transactionsStore.state.data
      const temp: Transaction = { ...vars, id: `temp-${Date.now()}` }
      setTransactions([temp, ...snapshot])
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) setTransactions(ctx.snapshot)
    },
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
