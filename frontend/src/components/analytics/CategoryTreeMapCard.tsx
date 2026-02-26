import { Card, Skeleton } from '@heroui/react'
import { ResponsiveTreeMap } from '@nivo/treemap'
import { useSpendingByCategory } from '../../queries/useAnalytics'
import { useResolvedChartTheme } from '../../config/nivoTheme'
import { Deferred } from '../ui/Deferred'

export function CategoryTreeMapCard({ months }: { months: number }) {
  const { theme: nivoTheme, colors } = useResolvedChartTheme()

  const { data: spendingItems = [], isLoading } = useSpendingByCategory(months)

  const treemapData = {
    id: 'spending',
    children: spendingItems.map((item) => ({ id: item.category, value: item.thisMonth })),
  }

  return (
    <Card>
      <Card.Header className="pb-0">
        <Card.Title>Category Tree</Card.Title>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <Skeleton className="h-52 w-full rounded-lg" />
        ) : treemapData.children.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-foreground-400 text-sm">
            No data
          </div>
        ) : (
          <div className="h-52">
            <Deferred fallback={<Skeleton className="h-52 w-full rounded-lg" />}>
              <ResponsiveTreeMap
                data={treemapData}
                identity="id"
                value="value"
                valueFormat=">-.2s"
                theme={nivoTheme}
                colors={colors}
                borderWidth={3}
                borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
                labelSkipSize={24}
                label={(node) => `${node.id}`}
                parentLabelSize={24}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              />
            </Deferred>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
