import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { getBudgets, getBudget, getBudgetVsActual, createBudget } from '../api/budget'
import { budgetKeys, transactionKeys } from './keys'
import type { BudgetPlan } from '../types/entities'

export const budgetsQueryOptions = queryOptions({
  queryKey: budgetKeys.all,
  queryFn: getBudgets,
})

export const budgetDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: budgetKeys.detail(id),
    queryFn: () => getBudget(id),
    enabled: Boolean(id),
  })

export const budgetVsActualQueryOptions = (id: string, category = 'all') =>
  queryOptions({
    queryKey: budgetKeys.vsActual(id, category),
    queryFn: () => getBudgetVsActual(id, category),
    enabled: Boolean(id),
  })

export function useBudgets() {
  return useQuery(budgetsQueryOptions)
}

export function useBudget(id: string) {
  return useQuery(budgetDetailQueryOptions(id))
}

export function useBudgetVsActual(id: string, category = 'all') {
  return useQuery(budgetVsActualQueryOptions(id, category))
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<BudgetPlan, 'id'>) => createBudget(body),
    onSettled: (created) => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      if (created) {
        void queryClient.invalidateQueries({ queryKey: budgetKeys.detail(created.id) })
      }
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}
