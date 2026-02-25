import { Button, Chip, Skeleton } from '@heroui/react'
import type { BudgetPlan } from '../../types/entities'

interface BudgetPlansListProps {
  budgets: BudgetPlan[]
  isLoading: boolean
  selectedMonth: string
  onSelect: (month: string) => void
}

export function BudgetPlansList({
  budgets,
  isLoading,
  selectedMonth,
  onSelect,
}: BudgetPlansListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    )
  }

  if (budgets.length === 0) {
    return <p className="text-sm text-foreground-400">No budget plans yet</p>
  }

  return (
    <div className="flex flex-col divide-y divide-divider">
      {budgets.map((b) => (
        <Button
          key={b.id}
          variant="ghost"
          className={`flex items-center justify-between py-3 w-full transition-colors ${
            b.month === selectedMonth ? 'text-primary' : ''
          }`}
          onPress={() => onSelect(b.month)}
        >
          <span className="text-sm font-medium">{b.month}</span>
          <Chip size="sm" variant="soft" color={b.month === selectedMonth ? 'accent' : 'default'}>
            {b.categories.length} categories
          </Chip>
        </Button>
      ))}
    </div>
  )
}
