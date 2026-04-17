import { Button, Card, Input, Label, ListBox, Select, TextField } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import {
  transactionFiltersStore,
  setTransactionFilter,
  resetTransactionFilters,
} from '../../store/transactionFiltersStore'
import { AppDatePicker } from '../ui/AppDatePicker'

export function TransactionFilters() {
  const filters = useStore(transactionFiltersStore, (s) => s)
  const [searchValue, setSearchValue] = useState(filters.search ?? '')

  // Keep local search value in sync with store when store is reset (e.g. via reset button)
  const storeSearch = filters.search ?? ''
  if (storeSearch !== searchValue && storeSearch === '') {
    setSearchValue('')
  }

  const hasFilters = Boolean(
    filters.startDate || filters.endDate || filters.category || filters.search,
  )

  // Sync debounced search to store
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactionFilter('search', searchValue || undefined)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchValue])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Filters</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-wrap gap-4 items-end">
          <TextField
            className="flex-1 min-w-60 max-w-md"
            aria-label="Search description"
            value={searchValue}
            onChange={setSearchValue}
            variant="secondary"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none z-10" />
              <Input
                placeholder="Search by description..."
                className="pl-9 w-full"
                variant="secondary"
              />
            </div>
          </TextField>

          <div className="flex flex-wrap gap-3 items-end">
            <AppDatePicker
              label="From"
              value={filters.startDate}
              onChange={(val) => setTransactionFilter('startDate', val)}
              variant="secondary"
            />

            <AppDatePicker
              label="To"
              value={filters.endDate}
              onChange={(val) => setTransactionFilter('endDate', val)}
              variant="secondary"
            />

            <Select
              aria-label="Filter by type"
              value={filters.category ?? 'all'}
              onChange={(key) =>
                setTransactionFilter('category', key === 'all' ? undefined : (key as string))
              }
              className="w-40"
              variant="secondary"
            >
              <Label>Type</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all" textValue="All types">
                    All types
                  </ListBox.Item>
                  <ListBox.Item id="income" textValue="Income">
                    Income
                  </ListBox.Item>
                  <ListBox.Item id="expense" textValue="Expense">
                    Expense
                  </ListBox.Item>
                  <ListBox.Item id="transfer" textValue="Transfer">
                    Transfer
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            {hasFilters && (
              <Button
                size="sm"
                variant="danger-soft"
                onPress={resetTransactionFilters}
                className="h-9"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
