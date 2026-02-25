import { apiFetch } from './client'
import type { Goal } from '../types/entities'
import type { GoalForecast, GoalContribution } from '../types/api'

export function getGoals(): Promise<Goal[]> {
  return apiFetch<Goal[]>('/goals')
}

export function getGoal(id: string): Promise<Goal> {
  return apiFetch<Goal>(`/goals/${id}`)
}

export function getGoalContributions(id: string): Promise<GoalContribution[]> {
  return apiFetch<GoalContribution[]>(`/goals/${id}/contributions`)
}

export function getGoalForecast(id: string): Promise<GoalForecast> {
  return apiFetch<GoalForecast>(`/goals/${id}/forecast`)
}

export function createGoal(body: Omit<Goal, 'id'>): Promise<Goal> {
  return apiFetch<Goal>('/goals', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
