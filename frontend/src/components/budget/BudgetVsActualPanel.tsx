import { Chip, Skeleton } from '@heroui/react'
import { Wallet } from 'lucide-react'
import { useBudgetVsActual } from '../../queries/useBudget'
import { Progress } from '../ui/Progress'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function BudgetVsActualPanel({ budgetId }: { budgetId: string }) {
  const { data: items = [], isLoading } = useBudgetVsActual(budgetId)

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
