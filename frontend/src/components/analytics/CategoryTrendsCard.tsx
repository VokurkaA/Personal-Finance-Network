import { Card, Chip } from '@heroui/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { analyticsStore } from '../../store/analyticsStore'

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-danger" />
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-success" />
  return <Minus className="w-4 h-4 text-foreground-400" />
}

export function CategoryTrendsCard({ months }: { months: number }) {
  const spendingItems = useStore(analyticsStore, (s) => s.spendingByCategory[months] ?? [])

  if (spendingItems.length === 0) return null

  return (
    <Card>
      <Card.Header className="pb-0">
        <Card.Title>Category Trends</Card.Title>
      </Card.Header>
      <Card.Content className="p-0">
        <div className="divide-y divide-divider">
          {spendingItems.map((item) => (
            <div key={item.category} className="flex items-center justify-between px-4 py-3 gap-4">
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
  )
}
