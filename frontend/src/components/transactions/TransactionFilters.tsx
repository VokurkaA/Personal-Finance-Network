import { Button, Card, Input, Label, ListBox, Select } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import {
  transactionFiltersStore,
  setTransactionFilter,
  resetTransactionFilters,
} from '../../store/transactionFiltersStore'

export function TransactionFilters() {
  const filters = useStore(transactionFiltersStore, (s) => s)
  const hasFilters = Boolean(filters.startDate || filters.endDate || filters.category)

  return (
    <Card>
      <Card.Header>
        <Card.Title>Filters</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-400 w-4 h-4 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search description…"
              aria-label="Search"
              className="pl-8"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium">From</Label>
            <Input
              type="date"
              className="w-40"
              value={filters.startDate ?? ''}
              onChange={(e) => setTransactionFilter('startDate', e.target.value || undefined)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium">To</Label>
            <Input
              type="date"
              className="w-40"
              value={filters.endDate ?? ''}
              onChange={(e) => setTransactionFilter('endDate', e.target.value || undefined)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium">Type</Label>
            <Select
              aria-label="Filter by type"
              selectedKey={filters.category ?? 'all'}
              onSelectionChange={(key) =>
                setTransactionFilter('category', key === 'all' ? undefined : (key as string))
              }
              className="w-40"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all">All types</ListBox.Item>
                  <ListBox.Item id="income">Income</ListBox.Item>
                  <ListBox.Item id="expense">Expense</ListBox.Item>
                  <ListBox.Item id="transfer">Transfer</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {hasFilters && (
            <Button size="sm" variant="danger-soft" onPress={resetTransactionFilters}>
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}
