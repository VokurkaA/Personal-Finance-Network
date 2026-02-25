import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCards, createCard } from '../api/cards'
import { cardKeys } from './keys'
import { cardsStore, setCards } from '../store/cardsStore'
import type { Card } from '../types/entities'

export function useCards() {
  const query = useQuery({
    queryKey: cardKeys.all,
    queryFn: getCards,
  })

  useEffect(() => {
    if (query.data) setCards(query.data)
  }, [query.data])

  return query
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Card, 'id'>) => createCard(body),
    onMutate: (vars) => {
      const snapshot = cardsStore.state.data
      const temp: Card = { ...vars, id: `temp-${Date.now()}` }
      setCards([...snapshot, temp])
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) setCards(ctx.snapshot)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cardKeys.all })
    },
  })
}
