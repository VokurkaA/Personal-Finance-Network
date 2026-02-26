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
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.all })
      const previous = queryClient.getQueryData<Card[]>(cardKeys.all)

      const temp: Card = { ...vars, id: `temp-${Date.now()}` }

      queryClient.setQueryData<Card[]>(cardKeys.all, (old) => [...(old || []), temp])

      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(cardKeys.all, ctx.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cardKeys.all })
    },
  })
}
