import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudgets, getBudget, getBudgetVsActual, createBudget } from '../api/budget'
import { budgetKeys, transactionKeys } from './keys'
import { budgetsStore, setBudgets, setBudgetVsActual } from '../store/budgetsStore'
import type { BudgetPlan } from '../types/entities'

export function useBudgets() {
  const query = useQuery({
    queryKey: budgetKeys.all,
    queryFn: getBudgets,
  })

  useEffect(() => {
    if (query.data) setBudgets(query.data)
  }, [query.data])

  return query
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => getBudget(id),
    enabled: Boolean(id),
  })
}

export function useBudgetVsActual(id: string, category = 'all') {
  const query = useQuery({
    queryKey: budgetKeys.vsActual(id, category),
    queryFn: () => getBudgetVsActual(id, category),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (query.data && id) setBudgetVsActual(id, query.data)
  }, [id, query.data])

  return query
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<BudgetPlan, 'id'>) => createBudget(body),
    onMutate: (vars) => {
      const snapshot = budgetsStore.state.data
      const temp: BudgetPlan = { ...vars, id: `temp-${Date.now()}` }
      setBudgets([...snapshot, temp])
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) setBudgets(ctx.snapshot)
    },
    onSettled: (created) => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      if (created) {
        void queryClient.invalidateQueries({ queryKey: budgetKeys.detail(created.id) })
      }
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}
