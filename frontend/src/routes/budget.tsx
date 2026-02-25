import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, Chip, Skeleton, Button, Input } from '@heroui/react'
import { Plus, Save, Wallet } from 'lucide-react'
import { useBudgetVsActual, useCreateBudget } from '../queries/useBudget'
import { useStore } from '@tanstack/react-store'
import { budgetsStore } from '../store/budgetsStore'
import { Progress } from '../components/ui/Progress'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

const DEFAULT_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Health',
  'Utilities',
  'Savings',
]

function BudgetVsActualPanel({ budgetId }: { budgetId: string }) {
  const { isLoading } = useBudgetVsActual(budgetId)
  const items = useStore(budgetsStore, (s) => s.budgetVsActual[budgetId] ?? [])

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0)
  const totalActual = items.reduce((s, i) => s + i.actual, 0)
  const overBudgetCount = items.filter((i) => i.percentageUsed > 100).length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-content2 rounded-xl">
          <p className="text-xs text-foreground-400">Budgeted</p>
          <p className="font-bold text-base">{fmt(totalPlanned)}</p>
        </div>
        <div className="flex flex-col items-center p-3 bg-content2 rounded-xl">
          <p className="text-xs text-foreground-400">Spent</p>
          <p
            className={`font-bold text-base ${totalActual > totalPlanned ? 'text-danger' : 'text-foreground'}`}
          >
            {fmt(totalActual)}
          </p>
        </div>
        <div className="flex flex-col items-center p-3 bg-content2 rounded-xl">
          <p className="text-xs text-foreground-400">Remaining</p>
          <p
            className={`font-bold text-base ${totalPlanned - totalActual < 0 ? 'text-danger' : 'text-success'}`}
          >
            {fmt(Math.max(totalPlanned - totalActual, 0))}
          </p>
        </div>
      </div>

      {overBudgetCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-xl">
          <Wallet className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm text-danger">
            {overBudgetCount} {overBudgetCount === 1 ? 'category is' : 'categories are'} over budget
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-foreground-400">No category data available yet</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const pct = Math.min(item.percentageUsed, 100)
            const color: 'danger' | 'warning' | 'success' =
              item.percentageUsed > 100
                ? 'danger'
                : item.percentageUsed > 80
                  ? 'warning'
                  : 'success'
            return (
              <div key={item.category} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-50">{item.category}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-foreground-400 text-xs">
                      {fmt(item.actual)} / {fmt(item.planned)}
                    </span>
                    <Chip size="sm" color={color} variant="soft">
                      {item.percentageUsed.toFixed(0)}%
                    </Chip>
                  </span>
                </div>
                <Progress value={pct} color={color} size="sm" />
                {item.percentageUsed > 100 && (
                  <p className="text-xs text-danger">Over by {fmt(item.actual - item.planned)}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NewBudgetForm({ month, onSuccess }: { month: string; onSuccess: () => void }) {
  const { mutate: createBudget, isPending } = useCreateBudget()
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c, ''])),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const categories = Object.entries(amounts)
      .filter(([, v]) => v !== '' && Number(v) > 0)
      .map(([category, budgetAmount]) => ({
        category,
        budgetAmount: Number(budgetAmount),
      }))
    if (categories.length === 0) return
    createBudget({ month, categories, notes: '' }, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-foreground-400">
        Set monthly budget limits for each category. Leave blank to skip.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_CATEGORIES.map((cat) => (
          <div key={cat} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">{cat}</label>
            <Input
              type="number"
              placeholder="0"
              value={amounts[cat]}
              onChange={(e) => setAmounts((prev) => ({ ...prev, [cat]: e.target.value }))}
              min={0}
            />
          </div>
        ))}
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        isDisabled={isPending}
        className="self-start"
      >
        <Save className="w-4 h-4 mr-1" />
        {isPending ? 'Saving…' : 'Create Budget Plan'}
      </Button>
    </form>
  )
}

function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const budgets = useStore(budgetsStore, (s) => s.data)
  const budgetsLoading = useStore(budgetsStore, (s) => s.status !== 'success')

  const currentBudget = budgets.find((b) => b.month === selectedMonth)

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card>
          <Card.Header className="flex items-center justify-between">
            <Card.Title>Budget Plan</Card.Title>
            <select
              className="border border-divider rounded-lg bg-background text-foreground text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none w-36"
              aria-label="Select month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Card.Header>
          <Card.Content>
            {budgetsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            ) : currentBudget ? (
              <BudgetVsActualPanel budgetId={currentBudget.id} />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 p-3 bg-content2 rounded-xl">
                  <Plus className="w-4 h-4 text-foreground-400 shrink-0" />
                  <p className="text-sm text-foreground-400">
                    No budget plan for{' '}
                    <span className="font-medium text-foreground">{selectedMonth}</span>. Create one
                    below.
                  </p>
                </div>
                <NewBudgetForm month={selectedMonth} onSuccess={() => {}} />
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <Card.Header>
            <Card.Title>All Budget Plans</Card.Title>
          </Card.Header>
          <Card.Content>
            {budgetsLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <p className="text-sm text-foreground-400">No budget plans yet</p>
            ) : (
              <div className="flex flex-col divide-y divide-divider">
                {budgets.map((b) => (
                  <button
                    key={b.id}
                    className={`flex items-center justify-between py-3 text-left w-full hover:text-primary transition-colors ${
                      b.month === selectedMonth ? 'text-primary' : ''
                    }`}
                    onClick={() => setSelectedMonth(b.month)}
                  >
                    <span className="text-sm font-medium">{b.month}</span>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={b.month === selectedMonth ? 'accent' : 'default'}
                    >
                      {b.categories.length} categories
                    </Chip>
                  </button>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
