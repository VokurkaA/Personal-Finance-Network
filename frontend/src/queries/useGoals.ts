import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import { getGoals, getGoal, getGoalContributions, getGoalForecast, createGoal } from '../api/goals'
import { goalKeys } from './keys'
import type { Goal } from '../types/entities'

export const goalsQueryOptions = queryOptions({
  queryKey: goalKeys.all,
  queryFn: getGoals,
})

export const goalDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
    enabled: Boolean(id),
  })

export const goalContributionsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: goalKeys.contributions(id),
    queryFn: () => getGoalContributions(id),
    enabled: Boolean(id),
  })

export const goalForecastQueryOptions = (id: string) =>
  queryOptions({
    queryKey: goalKeys.forecast(id),
    queryFn: () => getGoalForecast(id),
    enabled: Boolean(id),
  })

export function useGoals() {
  return useQuery(goalsQueryOptions)
}

export function useGoal(id: string) {
  return useQuery(goalDetailQueryOptions(id))
}

export function useGoalContributions(id: string) {
  return useQuery(goalContributionsQueryOptions(id))
}

export function useGoalForecast(id: string) {
  return useQuery(goalForecastQueryOptions(id))
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Goal, 'id'>) => createGoal(body),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}
