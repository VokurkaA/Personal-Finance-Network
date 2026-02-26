import { createLazyFileRoute } from '@tanstack/react-router'
import { Card, Chip, Skeleton } from '@heroui/react'
import { ResponsiveBar } from '@nivo/bar'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { useBudgetVsActual, useBudgets } from '../queries/useBudget'
import { useCashflow } from '../queries/useAnalytics'
import { useGoals } from '../queries/useGoals'
import { useTheme } from '../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../config/nivoTheme'
import { Progress } from '../components/ui/Progress'

export const Route = createLazyFileRoute('/')({
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

function TrendChip({ direction }: { direction: 'up' | 'down' | 'stable' }) {
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
}

function KpiCard({
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
}

function BudgetSummary({ budgetId, month }: { budgetId: string; month: string }) {
  const { data: budgetItems = [], isLoading } = useBudgetVsActual(budgetId)
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nivoTheme = getNivoTheme(isDark)
  const month = currentMonth()

  const { data: cashflow, isLoading: cfLoading } = useCashflow(month)
  const { data: goals = [], isLoading: goalsLoading } = useGoals()
  const { data: budgets = [] } = useBudgets()

  const currentBudget = budgets.find((b) => b.month === month)

  const nearestGoal = goals
    .slice()
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]

  const barData = cashflow
    ? [{ month: cashflow.month, Income: cashflow.totalIncome, Expenses: cashflow.totalExpenses }]
    : []

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
            ) : barData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-foreground-400 text-sm">
                No cashflow data for this month
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveBar
                  data={barData}
                  keys={['Income', 'Expenses']}
                  indexBy="month"
                  theme={nivoTheme}
                  colors={[CHART_COLORS[2], CHART_COLORS[4]]}
                  groupMode="grouped"
                  padding={0.5}
                  borderRadius={4}
                  axisLeft={{ format: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
                  axisBottom={null}
                  labelSkipHeight={20}
                  enableGridX={false}
                  margin={{ top: 10, right: 10, bottom: 10, left: 52 }}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'top-right',
                      direction: 'row',
                      translateY: -16,
                      translateX: 0,
                      itemWidth: 80,
                      itemHeight: 20,
                      symbolSize: 10,
                      symbolShape: 'circle',
                    },
                  ]}
                />
              </div>
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
