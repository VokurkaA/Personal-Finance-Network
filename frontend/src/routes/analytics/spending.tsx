import { createFileRoute } from '@tanstack/react-router'
import { useState, lazy, Suspense } from 'react'
import { Select, ListBox, Label, Skeleton } from '@heroui/react'
import { useStore } from '@tanstack/react-store'
import { analyticsStore } from '../../store/analyticsStore'
import { budgetsStore } from '../../store/budgetsStore'
import { useSpendingByCategory } from '../../queries/useAnalytics'
import { AnalyticsTabs } from '../../components/analytics/AnalyticsTabs'

const SpendingPieCard = lazy(() =>
  import('../../components/analytics/SpendingPieCard').then((m) => ({
    default: m.SpendingPieCard,
  })),
)
const MoMBarCard = lazy(() =>
  import('../../components/analytics/MoMBarCard').then((m) => ({ default: m.MoMBarCard })),
)
const CategoryTreeMapCard = lazy(() =>
  import('../../components/analytics/CategoryTreeMapCard').then((m) => ({
    default: m.CategoryTreeMapCard,
  })),
)
const CategoryTrendsCard = lazy(() =>
  import('../../components/analytics/CategoryTrendsCard').then((m) => ({
    default: m.CategoryTrendsCard,
  })),
)
const BudgetVsActualCard = lazy(() =>
  import('../../components/analytics/BudgetVsActualCard').then((m) => ({
    default: m.BudgetVsActualCard,
  })),
)

export const Route = createFileRoute('/analytics/spending')({
  component: SpendingAnalyticsPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function SpendingAnalyticsPage() {
  const [months, setMonths] = useState(1)
  const [selectedMonth] = useState(currentMonth())

  const { isLoading: spendingLoading } = useSpendingByCategory(months)
  const spendingItems = useStore(analyticsStore, (s) => s.spendingByCategory[months] ?? [])
  const totalThisMonth = spendingItems.reduce((s, i) => s + i.thisMonth, 0)

  const budgets = useStore(budgetsStore, (s) => s.data)
  const currentBudget = budgets.find((b) => b.month === selectedMonth)

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsTabs />

      <div className="flex items-center gap-3">
        <Label className="text-sm text-foreground-400 shrink-0">Range</Label>
        <Select
          aria-label="Select month range"
          selectedKey={String(months)}
          onSelectionChange={(key) => setMonths(Number(key))}
          className="w-44"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="1">This month</ListBox.Item>
              <ListBox.Item id="3">Last 3 months</ListBox.Item>
              <ListBox.Item id="6">Last 6 months</ListBox.Item>
              <ListBox.Item id="12">Last 12 months</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
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
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <SpendingPieCard months={months} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <MoMBarCard months={months} />
        </Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
        <CategoryTreeMapCard months={months} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <BudgetVsActualCard budgetId={currentBudget?.id} month={selectedMonth} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
        <CategoryTrendsCard months={months} />
      </Suspense>
    </div>
  )
}
