import { Store } from '@tanstack/store'
import type { Card } from '../types/entities'
import type { StoreStatus } from './types'

interface CardsState {
  data: Card[]
  status: StoreStatus
}

export const cardsStore = new Store<CardsState>({ data: [], status: 'idle' })

export function setCards(data: Card[]): void {
  cardsStore.setState(() => ({ data, status: 'success' }))
}

export function setCardsStatus(status: StoreStatus): void {
  cardsStore.setState((s) => ({ ...s, status }))
}
