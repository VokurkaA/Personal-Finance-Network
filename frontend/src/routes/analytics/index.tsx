import { createFileRoute } from '@tanstack/react-router'
import { useState, lazy, Suspense, startTransition } from 'react'
import { Select, ListBox, Label, Skeleton } from '@heroui/react'
import { AnalyticsTabs } from '../../components/analytics/AnalyticsTabs'

const MoneyFlowCard = lazy(() =>
  import('../../components/analytics/MoneyFlowCard').then((m) => ({ default: m.MoneyFlowCard })),
)
const AnomalyListCard = lazy(() =>
  import('../../components/analytics/AnomalyListCard').then((m) => ({
    default: m.AnomalyListCard,
  })),
)
const SpendingPatternsCard = lazy(() =>
  import('../../components/analytics/SpendingPatternsCard').then((m) => ({
    default: m.SpendingPatternsCard,
  })),
)

export const Route = createFileRoute('/analytics/')({
  component: AnalyticsIndexPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function AnalyticsIndexPage() {
  const [month, setMonth] = useState(currentMonth())

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsTabs />

      <div className="flex items-center gap-3">
        <Label className="text-sm text-foreground-400 shrink-0">Month</Label>
        <Select
          aria-label="Select month"
          selectedKey={month}
          onSelectionChange={(key) => {
            startTransition(() => {
              setMonth(key as string)
            })
          }}
          className="w-36"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {months.map((m) => (
                <ListBox.Item key={m} id={m}>
                  {m}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <Suspense fallback={<Skeleton className="h-72 w-full rounded-lg" />}>
        <MoneyFlowCard month={month} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <AnomalyListCard />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <SpendingPatternsCard />
      </Suspense>
    </div>
  )
}
