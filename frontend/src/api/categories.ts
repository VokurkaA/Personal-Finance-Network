import { apiFetch } from './client'
import type { Category } from '../types/entities'

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories')
}
