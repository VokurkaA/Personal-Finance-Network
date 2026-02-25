import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccounts, createAccount } from '../api/accounts'
import { accountKeys } from './keys'
import { accountsStore, setAccounts } from '../store/accountsStore'
import type { Account } from '../types/entities'

export function useAccounts() {
  const query = useQuery({
    queryKey: accountKeys.all,
    queryFn: getAccounts,
  })

  useEffect(() => {
    if (query.data) setAccounts(query.data)
  }, [query.data])

  return query
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Account, 'id' | 'createdAt'>) => createAccount(body),
    onMutate: (vars) => {
      const snapshot = accountsStore.state.data
      const temp: Account = {
        ...vars,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setAccounts([...snapshot, temp])
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) setAccounts(ctx.snapshot)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}
