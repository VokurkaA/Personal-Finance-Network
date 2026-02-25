import { Store } from '@tanstack/store'
import type { Goal } from '../types/entities'
import type { GoalForecast, GoalContribution } from '../types/api'
import type { StoreStatus } from './types'

interface GoalsState {
  data: Goal[]
  status: StoreStatus
  forecasts: Record<string, GoalForecast>
  contributions: Record<string, GoalContribution[]>
}

export const goalsStore = new Store<GoalsState>({
  data: [],
  status: 'idle',
  forecasts: {},
  contributions: {},
})

export function setGoals(data: Goal[]): void {
  goalsStore.setState((s) => ({ ...s, data, status: 'success' }))
}

export function setGoalsStatus(status: StoreStatus): void {
  goalsStore.setState((s) => ({ ...s, status }))
}

export function setGoalForecast(id: string, forecast: GoalForecast): void {
  goalsStore.setState((s) => ({ ...s, forecasts: { ...s.forecasts, [id]: forecast } }))
}

export function setGoalContributions(id: string, contributions: GoalContribution[]): void {
  goalsStore.setState((s) => ({
    ...s,
    contributions: { ...s.contributions, [id]: contributions },
  }))
}
