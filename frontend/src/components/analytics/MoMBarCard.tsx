import { Card, Skeleton } from '@heroui/react'
import { ResponsiveBar } from '@nivo/bar'
import { useSpendingByCategory } from '../../queries/useAnalytics'
import { useResolvedChartTheme } from '../../config/nivoTheme'
import { Deferred } from '../ui/Deferred'

export function MoMBarCard({ months }: { months: number }) {
  const { theme: nivoTheme, colors } = useResolvedChartTheme()

  const { data: spendingItems = [], isLoading } = useSpendingByCategory(months)

  const trendBarData = spendingItems.map((item) => ({
    category: item.category.length > 10 ? item.category.slice(0, 10) + '…' : item.category,
    'This Month': item.thisMonth,
    'Last Month': item.lastMonth,
  }))

  return (
    <Card>
      <Card.Header className="pb-0">
        <Card.Title>Month-over-Month Comparison</Card.Title>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : trendBarData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-foreground-400 text-sm">
            No data
          </div>
        ) : (
          <div className="h-64">
            <Deferred fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
              <ResponsiveBar
                data={trendBarData}
                keys={['This Month', 'Last Month']}
                indexBy="category"
                theme={nivoTheme}
                colors={[colors[0], colors[7]]}
                groupMode="grouped"
                padding={0.3}
                borderRadius={4}
                margin={{ top: 10, right: 10, bottom: 60, left: 60 }}
                axisBottom={{ tickRotation: -30 }}
                axisLeft={{ format: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
                labelSkipHeight={25}
                enableGridX={false}
              />
            </Deferred>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
