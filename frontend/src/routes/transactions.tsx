import { createFileRoute } from '@tanstack/react-router'
import { Card, Chip, Skeleton, Button, Input } from '@heroui/react'
import { useStore } from '@tanstack/react-store'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { Search, X, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react'
import { useTransactions } from '../queries/useTransactions'
import {
  transactionFiltersStore,
  setTransactionFilter,
  resetTransactionFilters,
} from '../store/transactionFiltersStore'

import type { Transaction } from '../types/entities'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
}

function TransactionsPage() {
  'use no memo'
  const filters = useStore(transactionFiltersStore, (s) => s)
  const { data: transactions = [], isLoading } = useTransactions(filters)

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info) => (
        <span className="text-xs text-foreground-400">
          {new Date(info.getValue<string>()).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => (
        <span className="text-sm font-medium truncate max-w-50 block">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (info) => {
        const row = info.row.original
        return (
          <span
            className={`font-semibold text-sm ${
              row.type === 'income'
                ? 'text-success'
                : row.type === 'expense'
                  ? 'text-danger'
                  : 'text-primary'
            }`}
          >
            {row.type === 'expense' ? '-' : '+'}
            {fmt(info.getValue<number>())}
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (info) => {
        const t = info.getValue<'income' | 'expense' | 'transfer'>()
        const color = t === 'income' ? 'success' : t === 'expense' ? 'danger' : 'accent'
        return (
          <Chip size="sm" color={color as never} variant="soft">
            {t}
          </Chip>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const s = info.getValue<'completed' | 'pending' | 'failed'>()
        const color = s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'danger'
        return (
          <Chip size="sm" color={color as never} variant="secondary">
            {s}
          </Chip>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info) => {
        const cat = info.getValue<string | undefined>()
        return cat ? (
          <Chip size="sm" variant="soft" color="default">
            {cat}
          </Chip>
        ) : (
          <span className="text-xs text-foreground-300">—</span>
        )
      },
    },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const hasFilters = Boolean(filters.startDate || filters.endDate || filters.category)

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
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
              <label className="text-xs font-medium text-zinc-500">From</label>
              <Input
                type="date"
                className="w-40"
                value={filters.startDate ?? ''}
                onChange={(e) => setTransactionFilter('startDate', e.target.value || undefined)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">To</label>
              <Input
                type="date"
                className="w-40"
                value={filters.endDate ?? ''}
                onChange={(e) => setTransactionFilter('endDate', e.target.value || undefined)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Type</label>
              <select
                className="border border-divider rounded-lg bg-background text-foreground text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                value={filters.category ?? ''}
                onChange={(e) => setTransactionFilter('category', e.target.value || undefined)}
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
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

      {/* Transactions table */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <Card.Title>Transactions</Card.Title>
          {!isLoading && (
            <span className="text-xs text-foreground-400">{transactions.length} records</span>
          )}
        </Card.Header>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider">
                    {table.getHeaderGroups().flatMap((hg) =>
                      hg.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-4 py-3 text-left font-medium text-foreground-400 cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' && (
                              <ArrowUp className="w-3 h-3" />
                            )}
                            {header.column.getIsSorted() === 'desc' && (
                              <ArrowDown className="w-3 h-3" />
                            )}
                          </span>
                        </th>
                      )),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-foreground-400">
                        <div className="flex flex-col items-center gap-2">
                          <ArrowLeftRight className="w-8 h-8" />
                          <p className="text-sm">No transactions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b border-divider last:border-0">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
