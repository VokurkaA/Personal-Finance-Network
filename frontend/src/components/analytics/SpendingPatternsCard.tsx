import { Card, Skeleton } from '@heroui/react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { useSpendingPatterns } from '../../queries/useAnalytics'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme } from '../../config/nivoTheme'

type PatternRow = { id: string; data: { x: string; y: number }[] }
type BackendPattern = {
  category: string
  monthlyData: Record<string, number>
  averageMonthly: number
  isRecurring: boolean
  months: number
}

export function SpendingPatternsCard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nivoTheme = getNivoTheme(isDark)

  const { data: patternsRaw, isLoading } = useSpendingPatterns(3)
  const patterns: PatternRow[] = patternsRaw
    ? (patternsRaw as BackendPattern[]).map((p) => ({
        id: p.category,
        data: Object.entries(p.monthlyData ?? {})
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, amount]) => ({ x: month, y: amount })),
      }))
    : []

  return (
    <Card>
      <Card.Header className="pb-0">
        <Card.Title>Spending Patterns (last 3 months)</Card.Title>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : patterns.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-foreground-400 text-sm">
            No pattern data available
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveHeatMap
              data={patterns}
              theme={nivoTheme}
              colors={{ type: 'sequential', scheme: 'blues' }}
              margin={{ top: 20, right: 60, bottom: 60, left: 80 }}
              axisTop={null}
              axisLeft={{ tickSize: 5 }}
              axisBottom={{ tickRotation: -30 }}
              borderRadius={2}
              borderWidth={2}
              borderColor={isDark ? '#18181b' : '#f4f4f5'}
            />
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
