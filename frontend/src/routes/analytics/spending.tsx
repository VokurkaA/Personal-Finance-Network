import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, Chip, Skeleton } from '@heroui/react'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveTreeMap } from '@nivo/treemap'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useSpendingByCategory } from '../../queries/useAnalytics'
import { useBudgets, useBudgetVsActual } from '../../queries/useBudget'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../../config/nivoTheme'

export const Route = createFileRoute('/analytics/spending')({
  component: SpendingAnalyticsPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-danger" />
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-success" />
  return <Minus className="w-4 h-4 text-foreground-400" />
}

function BudgetVsActualChart({
  budgetId,
  nivoTheme,
}: {
  budgetId: string
  nivoTheme: object
  isDark: boolean
}) {
  const { data: items = [], isLoading } = useBudgetVsActual(budgetId)
  const barData = items.map((i) => ({
    category: i.category.length > 12 ? i.category.slice(0, 12) + '…' : i.category,
    Budget: i.planned,
    Actual: i.actual,
  }))

  if (isLoading) return <Skeleton className="h-48 w-full rounded-lg" />
  if (barData.length === 0)
    return (
      <div className="flex h-48 items-center justify-center text-foreground-400 text-sm">
        No budget data available
      </div>
    )

  return (
    <div className="h-48">
      <ResponsiveBar
        data={barData}
        keys={['Budget', 'Actual']}
        indexBy="category"
        theme={nivoTheme as never}
        colors={[CHART_COLORS[0], CHART_COLORS[4]]}
        groupMode="grouped"
        padding={0.3}
        borderRadius={4}
        margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
        axisBottom={{ tickRotation: -30 }}
        axisLeft={{ format: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
        labelSkipHeight={20}
        enableGridX={false}
      />
    </div>
  )
}

function SpendingAnalyticsPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nivoTheme = getNivoTheme(isDark)

  const [months, setMonths] = useState(1)
  const [selectedMonth] = useState(currentMonth())

  const { data: spendingItems = [], isLoading: spendingLoading } = useSpendingByCategory(months)
  const { data: budgets = [] } = useBudgets()
  const currentBudget = budgets.find((b) => b.month === selectedMonth)

  const pieData = spendingItems.map((item, i) => ({
    id: item.category,
    label: item.category,
    value: item.thisMonth,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const trendBarData = spendingItems.map((item) => ({
    category: item.category.length > 10 ? item.category.slice(0, 10) + '…' : item.category,
    'This Month': item.thisMonth,
    'Last Month': item.lastMonth,
  }))

  const treemapData = {
    id: 'spending',
    children: spendingItems.map((item) => ({
      id: item.category,
      value: item.thisMonth,
    })),
  }

  const totalThisMonth = spendingItems.reduce((s, i) => s + i.thisMonth, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex border-b border-divider">
        {[
          { to: '/analytics', label: 'Money Flow', exact: true },
          {
            to: '/analytics/spending',
            label: 'Spending Analysis',
            exact: false,
          },
        ].map(({ to, label, exact }) => (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
              exact
                ? pathname === to
                : pathname.startsWith(to)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-400 hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-foreground-400 shrink-0">Range</label>
        <select
          className="border border-divider rounded-lg bg-background text-foreground text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none w-36"
          aria-label="Select month range"
          value={String(months)}
          onChange={(e) => setMonths(Number(e.target.value))}
        >
          <option value="1">This month</option>
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
        {!spendingLoading && (
          <span className="text-sm text-foreground-400">
            Total:{' '}
            <span className="font-semibold text-foreground">
              ${totalThisMonth.toLocaleString()}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <Card.Header className="pb-0">
            <Card.Title>Spending by Category</Card.Title>
          </Card.Header>
          <Card.Content>
            {spendingLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : pieData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-foreground-400 text-sm">
                No spending data
              </div>
            ) : (
              <div className="h-64">
                <ResponsivePie
                  data={pieData}
                  theme={nivoTheme}
                  colors={CHART_COLORS}
                  innerRadius={0.55}
                  padAngle={2}
                  cornerRadius={4}
                  margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                  enableArcLinkLabels
                  arcLinkLabelsTextColor={isDark ? '#a1a1aa' : '#52525b'}
                  arcLinkLabelsThickness={2}
                  arcLabelsSkipAngle={12}
                  legends={[
                    {
                      anchor: 'right',
                      direction: 'column',
                      translateX: 80,
                      itemWidth: 80,
                      itemHeight: 18,
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
          <Card.Header className="pb-0">
            <Card.Title>Month-over-Month Comparison</Card.Title>
          </Card.Header>
          <Card.Content>
            {spendingLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : trendBarData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-foreground-400 text-sm">
                No data
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveBar
                  data={trendBarData}
                  keys={['This Month', 'Last Month']}
                  indexBy="category"
                  theme={nivoTheme}
                  colors={[CHART_COLORS[0], CHART_COLORS[1]]}
                  groupMode="grouped"
                  padding={0.3}
                  borderRadius={4}
                  margin={{ top: 10, right: 10, bottom: 60, left: 60 }}
                  axisBottom={{ tickRotation: -30 }}
                  axisLeft={{
                    format: (v: number) => `$${(v / 1000).toFixed(0)}k`,
                  }}
                  labelSkipHeight={25}
                  enableGridX={false}
                />
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Header className="pb-0">
          <Card.Title>Category Tree</Card.Title>
        </Card.Header>
        <Card.Content>
          {spendingLoading ? (
            <Skeleton className="h-52 w-full rounded-lg" />
          ) : treemapData.children.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-foreground-400 text-sm">
              No data
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveTreeMap
                data={treemapData}
                identity="id"
                value="value"
                valueFormat=">-.2s"
                theme={nivoTheme}
                colors={CHART_COLORS}
                borderWidth={3}
                borderColor={isDark ? '#18181b' : '#f4f4f5'}
                labelSkipSize={24}
                label={(node) => `${node.id}`}
                parentLabelSize={24}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              />
            </div>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="pb-0">
          <Card.Title>Budget vs Actual — {selectedMonth}</Card.Title>
        </Card.Header>
        <Card.Content>
          {!currentBudget ? (
            <p className="text-sm text-foreground-400">
              No budget plan for {selectedMonth}. Create one on the{' '}
              <a href="/budget" className="text-primary underline">
                Budget
              </a>{' '}
              page.
            </p>
          ) : (
            <BudgetVsActualChart
              budgetId={currentBudget.id}
              nivoTheme={nivoTheme}
              isDark={isDark}
            />
          )}
        </Card.Content>
      </Card>

      {!spendingLoading && spendingItems.length > 0 && (
        <Card>
          <Card.Header className="pb-0">
            <Card.Title>Category Trends</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="divide-y divide-divider">
              {spendingItems.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between px-4 py-3 gap-4"
                >
                  <span className="text-sm font-medium w-40 truncate">{item.category}</span>
                  <span className="text-sm font-bold">${item.thisMonth.toLocaleString()}</span>
                  <span className="text-xs text-foreground-400">
                    vs ${item.lastMonth.toLocaleString()} last mo.
                  </span>
                  <TrendIcon direction={item.trend} />
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      item.trend === 'up' ? 'danger' : item.trend === 'down' ? 'success' : 'default'
                    }
                  >
                    {item.trend === 'up'
                      ? `+${(((item.thisMonth - item.lastMonth) / (item.lastMonth || 1)) * 100).toFixed(0)}%`
                      : item.trend === 'down'
                        ? `-${(((item.lastMonth - item.thisMonth) / (item.lastMonth || 1)) * 100).toFixed(0)}%`
                        : '—'}
                  </Chip>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}
