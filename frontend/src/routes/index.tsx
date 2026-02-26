import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense, memo } from 'react'
import { Card, Chip, Skeleton } from '@heroui/react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { useBudgetVsActual } from '../queries/useBudget'
import { useStore } from '@tanstack/react-store'
import { analyticsStore } from '../store/analyticsStore'
import { goalsStore } from '../store/goalsStore'
import { budgetsStore } from '../store/budgetsStore'
import { Progress } from '../components/ui/Progress'

const CashflowBarChart = lazy(() =>
  import('../components/dashboard/CashflowBarChart').then((m) => ({ default: m.CashflowBarChart })),
)

export const Route = createFileRoute('/')({
  component: DashboardPage,
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

const TrendChip = memo(function TrendChip({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up')
    return (
      <Chip color="success" variant="soft" size="sm">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Up
        </span>
      </Chip>
    )
  if (direction === 'down')
    return (
      <Chip color="danger" variant="soft" size="sm">
        <span className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          Down
        </span>
      </Chip>
    )
  return (
    <Chip color="default" variant="soft" size="sm">
      <span className="flex items-center gap-1">
        <Minus className="w-3 h-3" />
        Stable
      </span>
    </Chip>
  )
})

const KpiCard = memo(function KpiCard({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string
  value: string
  icon: React.ReactNode
  isLoading?: boolean
}) {
  return (
    <Card>
      <Card.Content className="flex flex-row items-center gap-4 p-4">
        <div className="rounded-xl p-2 bg-content2">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-foreground-400 truncate">{label}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-24 rounded mt-1" />
          ) : (
            <p className="text-xl font-bold truncate">{value}</p>
          )}
        </div>
      </Card.Content>
    </Card>
  )
})

function BudgetSummary({ budgetId, month }: { budgetId: string; month: string }) {
  const { isLoading } = useBudgetVsActual(budgetId)
  const budgetItems = useStore(budgetsStore, (s) => s.budgetVsActual[budgetId] ?? [])
  const totalBudgeted = budgetItems.reduce((s, i) => s + i.planned, 0)
  const totalSpent = budgetItems.reduce((s, i) => s + i.actual, 0)

  return (
    <Card>
      <Card.Header className="flex items-center justify-between">
        <Card.Title>Budget Summary — {month}</Card.Title>
        {!isLoading && (
          <span className="text-xs text-foreground-400">
            {fmt(totalSpent)} / {fmt(totalBudgeted)}
          </span>
        )}
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded" />
            ))}
          </div>
        ) : budgetItems.length === 0 ? (
          <p className="text-sm text-foreground-400">No budget data for this month</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {budgetItems.slice(0, 8).map((item) => {
              const color =
                item.percentageUsed > 100
                  ? 'danger'
                  : item.percentageUsed > 80
                    ? 'warning'
                    : 'success'
              return (
                <div key={item.category} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate">{item.category}</span>
                    <span className="text-foreground-400 shrink-0 ml-2">
                      {fmt(item.actual)} / {fmt(item.planned)}
                    </span>
                  </div>
                  <Progress value={Math.min(item.percentageUsed, 100)} color={color} size="sm" />
                </div>
              )
            })}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

function DashboardPage() {
  const month = currentMonth()

  const cashflow = useStore(analyticsStore, (s) => s.cashflow[month])
  const cfLoading = !cashflow
  const goals = useStore(goalsStore, (s) => s.data)
  const goalsLoading = useStore(goalsStore, (s) => s.status !== 'success')
  const budgets = useStore(budgetsStore, (s) => s.data)

  const currentBudget = budgets.find((b) => b.month === month)

  const nearestGoal = goals
    .slice()
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Income"
          value={cashflow ? fmt(cashflow.totalIncome) : '—'}
          icon={<ArrowUpRight className="w-5 h-5 text-success" />}
          isLoading={cfLoading}
        />
        <KpiCard
          label="Total Expenses"
          value={cashflow ? fmt(cashflow.totalExpenses) : '—'}
          icon={<ArrowDownLeft className="w-5 h-5 text-danger" />}
          isLoading={cfLoading}
        />
        <KpiCard
          label="Net Cashflow"
          value={cashflow ? fmt(cashflow.netCashflow) : '—'}
          icon={<Wallet className="w-5 h-5 text-primary" />}
          isLoading={cfLoading}
        />
        <KpiCard
          label="Savings Rate"
          value={cashflow ? `${(cashflow.savingsRate * 100).toFixed(1)}%` : '—'}
          icon={<Target className="w-5 h-5 text-warning" />}
          isLoading={cfLoading}
        />
      </div>

      {/* Cashflow chart + Nearest goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Cashflow — {month}</Card.Title>
          </Card.Header>
          <Card.Content>
            {cfLoading ? (
              <Skeleton className="h-52 w-full rounded-lg" />
            ) : !cashflow ? (
              <div className="flex h-52 items-center justify-center text-foreground-400 text-sm">
                No cashflow data for this month
              </div>
            ) : (
              <Suspense fallback={<Skeleton className="h-52 w-full rounded-lg" />}>
                <CashflowBarChart
                  month={cashflow.month}
                  totalIncome={cashflow.totalIncome}
                  totalExpenses={cashflow.totalExpenses}
                />
              </Suspense>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <Card.Title>Nearest Goal</Card.Title>
          </Card.Header>
          <Card.Content>
            {goalsLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            ) : !nearestGoal ? (
              <p className="text-sm text-foreground-400">No goals set</p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight">{nearestGoal.name}</p>
                  <Chip size="sm" variant="soft" color="accent" className="shrink-0">
                    {nearestGoal.type}
                  </Chip>
                </div>
                <Progress
                  value={(nearestGoal.currentAmount / nearestGoal.targetAmount) * 100}
                  color="primary"
                  size="md"
                  showValueLabel
                  label={`${fmt(nearestGoal.currentAmount)} / ${fmt(nearestGoal.targetAmount)}`}
                />
                <p className="text-xs text-foreground-400">
                  Deadline: {new Date(nearestGoal.deadline).toLocaleDateString()}
                </p>
                <p className="text-xs text-foreground-400">
                  Risk: <span className="font-medium capitalize">{nearestGoal.riskProfile}</span>
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Budget summary */}
      {currentBudget ? (
        <BudgetSummary budgetId={currentBudget.id} month={month} />
      ) : (
        <Card>
          <Card.Content>
            <p className="text-sm text-foreground-400">
              No budget plan found for {month}. Create one on the{' '}
              <a href="/budget" className="text-primary underline">
                Budget
              </a>{' '}
              page.
            </p>
          </Card.Content>
        </Card>
      )}

      {/* Expense category breakdown */}
      {cashflow && cashflow.expenses.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Expense Breakdown</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cashflow.expenses.map((exp) => (
                <div key={exp.category} className="flex flex-col items-center gap-1 text-center">
                  <p className="text-lg font-bold">{exp.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-foreground-400 truncate w-full">{exp.category}</p>
                  <p className="text-xs font-medium">{fmt(exp.amount)}</p>
                  <TrendChip direction="stable" />
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}
