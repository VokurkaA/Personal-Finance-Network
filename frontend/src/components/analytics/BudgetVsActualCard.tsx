import { Card, Skeleton } from '@heroui/react'
import { ResponsiveBar } from '@nivo/bar'
import { useStore } from '@tanstack/react-store'
import { budgetsStore } from '../../store/budgetsStore'
import { useBudgetVsActual } from '../../queries/useBudget'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../../config/nivoTheme'

interface BudgetVsActualCardProps {
  budgetId: string | undefined
  month: string
}

function BudgetBarChart({ budgetId }: { budgetId: string }) {
  const { theme } = useTheme()
  const nivoTheme = getNivoTheme(theme === 'dark')

  const { isLoading } = useBudgetVsActual(budgetId)
  const items = useStore(budgetsStore, (s) => s.budgetVsActual[budgetId] ?? [])

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

export function BudgetVsActualCard({ budgetId, month }: BudgetVsActualCardProps) {
  return (
    <Card>
      <Card.Header className="pb-0">
        <Card.Title>Budget vs Actual — {month}</Card.Title>
      </Card.Header>
      <Card.Content>
        {!budgetId ? (
          <p className="text-sm text-foreground-400">
            No budget plan for {month}. Create one on the{' '}
            <a href="/budget" className="text-primary underline">
              Budget
            </a>{' '}
            page.
          </p>
        ) : (
          <BudgetBarChart budgetId={budgetId} />
        )}
      </Card.Content>
    </Card>
  )
}
