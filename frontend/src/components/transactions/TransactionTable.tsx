import { Card, Chip, Skeleton } from '@heroui/react'
import { useStore } from '@tanstack/react-store'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react'
import { useTransactions } from '../../queries/useTransactions'
import { transactionFiltersStore } from '../../store/transactionFiltersStore'
import { transactionsStore } from '../../store/transactionsStore'
import type { Transaction } from '../../types/entities'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
}

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
      <span className="text-sm font-medium truncate max-w-50 block">{info.getValue<string>()}</span>
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

export function TransactionTable() {
  'use no memo'
  const filters = useStore(transactionFiltersStore, (s) => s)
  const { isLoading } = useTransactions(filters)
  const transactions = useStore(transactionsStore, (s) => s.data)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
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
                          {header.column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
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
  )
}
