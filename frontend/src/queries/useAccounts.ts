import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccounts, createAccount } from '../api/accounts'
import { accountKeys } from './keys'
import type { Account } from '../types/entities'

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: getAccounts,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Account, 'id' | 'createdAt'>) => createAccount(body),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.all })
      const previous = queryClient.getQueryData<Account[]>(accountKeys.all)

      const temp: Account = {
        ...vars,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<Account[]>(accountKeys.all, (old) => [...(old || []), temp])

      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(accountKeys.all, ctx.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}
