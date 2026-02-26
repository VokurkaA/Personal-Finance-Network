import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Select, ListBox, Label } from '@heroui/react'
import { AnalyticsTabs } from '../../components/analytics/AnalyticsTabs'
import { MoneyFlowCard } from '../../components/analytics/MoneyFlowCard'
import { AnomalyListCard } from '../../components/analytics/AnomalyListCard'
import { SpendingPatternsCard } from '../../components/analytics/SpendingPatternsCard'

import {
  spendingFlowQueryOptions,
  anomaliesQueryOptions,
  spendingPatternsQueryOptions,
} from '../../queries/useAnalytics'

export const Route = createFileRoute('/analytics/')({
  loader: ({ context: { queryClient } }) => {
    const month = currentMonth()
    return Promise.all([
      queryClient.ensureQueryData(spendingFlowQueryOptions(month)),
      queryClient.ensureQueryData(anomaliesQueryOptions(0.9)),
      queryClient.ensureQueryData(spendingPatternsQueryOptions(3)),
    ])
  },
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
          onSelectionChange={(key) => setMonth(key as string)}
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

      <MoneyFlowCard month={month} />
      <AnomalyListCard />
      <SpendingPatternsCard />
    </div>
  )
}
