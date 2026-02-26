import { Card, Skeleton } from '@heroui/react'
import { ResponsivePie } from '@nivo/pie'
import { useStore } from '@tanstack/react-store'
import { analyticsStore } from '../../store/analyticsStore'
import { useSpendingByCategory } from '../../queries/useAnalytics'
import { useResolvedChartTheme } from '../../config/nivoTheme'
import { Deferred } from '../ui/Deferred'

export function SpendingPieCard({ months }: { months: number }) {
  const { theme: nivoTheme, colors } = useResolvedChartTheme()

  const { isLoading } = useSpendingByCategory(months)
  const spendingItems = useStore(analyticsStore, (s) => s.spendingByCategory[months] ?? [])

  const pieData = spendingItems.map((item, i) => ({
    id: item.category,
    label: item.category,
    value: item.thisMonth,
    color: colors[i % colors.length],
  }))

  return (
    <Card>
      <Card.Header className="pb-0">
        <Card.Title>Spending by Category</Card.Title>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : pieData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-foreground-400 text-sm">
            No spending data
          </div>
        ) : (
          <div className="h-64">
            <Deferred fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
              <ResponsivePie
                data={pieData}
                theme={nivoTheme}
                colors={colors}
                innerRadius={0.55}
                padAngle={2}
                cornerRadius={4}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                enableArcLinkLabels
                arcLinkLabelsTextColor={nivoTheme.text?.fill}
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
            </Deferred>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
