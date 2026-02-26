import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Select, ListBox, Label } from '@heroui/react'
import {
  useSpendingByCategory,
  spendingByCategoryQueryOptions,
} from '../../queries/useAnalytics'
import { useBudgets, budgetsQueryOptions } from '../../queries/useBudget'
import { AnalyticsTabs } from '../../components/analytics/AnalyticsTabs'
import { SpendingPieCard } from '../../components/analytics/SpendingPieCard'
import { MoMBarCard } from '../../components/analytics/MoMBarCard'
import { CategoryTreeMapCard } from '../../components/analytics/CategoryTreeMapCard'
import { CategoryTrendsCard } from '../../components/analytics/CategoryTrendsCard'
import { BudgetVsActualCard } from '../../components/analytics/BudgetVsActualCard'

export const Route = createFileRoute('/analytics/spending')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(spendingByCategoryQueryOptions(1)),
      queryClient.ensureQueryData(budgetsQueryOptions),
    ]),
  component: SpendingAnalyticsPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function SpendingAnalyticsPage() {
  const [months, setMonths] = useState(1)
  const [selectedMonth] = useState(currentMonth())

  const { data: spendingItems = [], isLoading: spendingLoading } = useSpendingByCategory(months)
  const totalThisMonth = spendingItems.reduce((s, i) => s + i.thisMonth, 0)

  const { data: budgets = [] } = useBudgets()
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
        <SpendingPieCard months={months} />
        <MoMBarCard months={months} />
      </div>

      <CategoryTreeMapCard months={months} />

      <BudgetVsActualCard budgetId={currentBudget?.id} month={selectedMonth} />

      <CategoryTrendsCard months={months} />
    </div>
  )
}
