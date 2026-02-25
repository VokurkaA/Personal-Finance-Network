import { apiFetch } from './client'
import type { BudgetPlan } from '../types/entities'
import type { BudgetVsActualItem } from '../types/api'

export function getBudgets(): Promise<BudgetPlan[]> {
  return apiFetch<BudgetPlan[]>('/budgets')
}

export function getBudget(id: string): Promise<BudgetPlan> {
  return apiFetch<BudgetPlan>(`/budgets/${id}`)
}

export function getBudgetVsActual(
  id: string,
  category = 'all',
): Promise<BudgetVsActualItem[]> {
  return apiFetch<BudgetVsActualItem[]>(`/budgets/${id}/vs-actual?category=${category}`)
}

export function createBudget(body: Omit<BudgetPlan, 'id'>): Promise<BudgetPlan> {
  return apiFetch<BudgetPlan>('/budgets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
