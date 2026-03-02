import { useQuery, queryOptions } from '@tanstack/react-query'
import { getCategories } from '../api/categories'
import { categoryKeys } from './keys'

export const categoriesQueryOptions = queryOptions({
  queryKey: categoryKeys.all,
  queryFn: getCategories,
})

export function useCategories() {
  return useQuery(categoriesQueryOptions)
}
