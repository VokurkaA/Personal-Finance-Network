import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCards, createCard } from '../api/cards'
import { cardKeys } from './keys'
import type { Card } from '../types/entities'

export function useCards() {
  return useQuery({
    queryKey: cardKeys.all,
    queryFn: getCards,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<Card, 'id'>) => createCard(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cardKeys.all })
    },
  })
}
