import { Store } from '@tanstack/store'
import type { BudgetPlan } from '../types/entities'
import type { BudgetVsActualItem } from '../types/api'
import type { StoreStatus } from './types'

interface BudgetsState {
  data: BudgetPlan[]
  status: StoreStatus
  budgetVsActual: Record<string, BudgetVsActualItem[]>
}

export const budgetsStore = new Store<BudgetsState>({
  data: [],
  status: 'idle',
  budgetVsActual: {},
})

export function setBudgets(data: BudgetPlan[]): void {
  budgetsStore.setState((s) => ({ ...s, data, status: 'success' }))
}

export function setBudgetsStatus(status: StoreStatus): void {
  budgetsStore.setState((s) => ({ ...s, status }))
}

export function setBudgetVsActual(id: string, data: BudgetVsActualItem[]): void {
  budgetsStore.setState((s) => ({
    ...s,
    budgetVsActual: { ...s.budgetVsActual, [id]: data },
  }))
}
