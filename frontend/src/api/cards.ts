import { apiFetch } from './client'
import type { Card } from '../types/entities'

export function getCards(): Promise<Card[]> {
  return apiFetch<Card[]>('/cards')
}

export function createCard(body: Omit<Card, 'id'>): Promise<Card> {
  return apiFetch<Card>('/cards', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
