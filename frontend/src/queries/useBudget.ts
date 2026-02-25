import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudget, getBudgetVsActual, createBudget } from '../api/budget'
import { budgetKeys, transactionKeys } from './keys'
import type { BudgetPlan } from '../types/entities'

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => getBudget(id),
    enabled: Boolean(id),
  })
}

export function useBudgetVsActual(id: string, category = 'all') {
  return useQuery({
    queryKey: budgetKeys.vsActual(id, category),
    queryFn: () => getBudgetVsActual(id, category),
    enabled: Boolean(id),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<BudgetPlan, 'id'>) => createBudget(body),
    onSuccess: (created) => {
      // Invalidate the newly created budget and related transaction cache
      void queryClient.invalidateQueries({ queryKey: budgetKeys.detail(created.id) })
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}
