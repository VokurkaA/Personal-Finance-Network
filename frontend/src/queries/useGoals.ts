import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, getGoal, getGoalContributions, getGoalForecast, createGoal } from '../api/goals'
import { goalKeys } from './keys'
import { goalsStore, setGoals, setGoalForecast, setGoalContributions } from '../store/goalsStore'
import type { Goal } from '../types/entities'

export function useGoals() {
  const query = useQuery({
    queryKey: goalKeys.all,
    queryFn: getGoals,
  })

  useEffect(() => {
    if (query.data) setGoals(query.data)
  }, [query.data])

  return query
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
    enabled: Boolean(id),
  })
}

export function useGoalContributions(id: string) {
  const query = useQuery({
    queryKey: goalKeys.contributions(id),
    queryFn: () => getGoalContributions(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (query.data && id) setGoalContributions(id, query.data)
  }, [id, query.data])

  return query
}

export function useGoalForecast(id: string) {
  const query = useQuery({
    queryKey: goalKeys.forecast(id),
    queryFn: () => getGoalForecast(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (query.data && id) setGoalForecast(id, query.data)
  }, [id, query.data])

  return query
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Goal, 'id'>) => createGoal(body),
    onMutate: (vars) => {
      const snapshot = goalsStore.state.data
      const temp: Goal = { ...vars, id: `temp-${Date.now()}` }
      setGoals([...snapshot, temp])
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) setGoals(ctx.snapshot)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}
