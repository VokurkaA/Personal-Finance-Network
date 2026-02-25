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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}
