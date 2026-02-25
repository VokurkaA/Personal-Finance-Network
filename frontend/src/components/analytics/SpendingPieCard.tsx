import { Card, Skeleton } from '@heroui/react'
import { ResponsivePie } from '@nivo/pie'
import { useStore } from '@tanstack/react-store'
import { analyticsStore } from '../../store/analyticsStore'
import { useSpendingByCategory } from '../../queries/useAnalytics'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../../config/nivoTheme'

export function SpendingPieCard({ months }: { months: number }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nivoTheme = getNivoTheme(isDark)

  const { isLoading } = useSpendingByCategory(months)
  const spendingItems = useStore(analyticsStore, (s) => s.spendingByCategory[months] ?? [])

  const pieData = spendingItems.map((item, i) => ({
    id: item.category,
    label: item.category,
    value: item.thisMonth,
    color: CHART_COLORS[i % CHART_COLORS.length],
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
  )
}
