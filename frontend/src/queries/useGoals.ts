import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGoals,
  getGoal,
  getGoalContributions,
  getGoalForecast,
  createGoal,
} from '../api/goals'
import { goalKeys } from './keys'
import type { Goal } from '../types/entities'

export function useGoals() {
  return useQuery({
    queryKey: goalKeys.all,
    queryFn: getGoals,
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
    enabled: Boolean(id),
  })
}

export function useGoalContributions(id: string) {
  return useQuery({
    queryKey: goalKeys.contributions(id),
    queryFn: () => getGoalContributions(id),
    enabled: Boolean(id),
  })
}

export function useGoalForecast(id: string) {
  return useQuery({
    queryKey: goalKeys.forecast(id),
    queryFn: () => getGoalForecast(id),
    enabled: Boolean(id),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Goal, 'id'>) => createGoal(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}
