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
  const { theme: nivoTheme } = useResolvedChartTheme()

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
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : patterns.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted text-sm italic">
            No pattern data available
          </div>
        ) : (
          <div className="h-64">
            <Deferred fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
              <ResponsiveHeatMap
                data={patterns}
                theme={nivoTheme}
                colors={{
                  type: 'quantize',
                  steps: 7,
                  colors: [
                    '#f4f4f5', // zinc-100 (fallback)
                    '#dcfce7', // green-100
                    '#bbf7d0', // green-200
                    '#86efac', // green-300
                    '#4ade80', // green-400
                    '#22c55e', // green-500
                    '#16a34a', // green-600
                  ],
                }}
                // Dynamically use accent color if possible, but for heatmap a sequential scale is better
                // HeroUI accent is typically blue/indigo, let's use a nice blue scale that fits the vibe
                margin={{ top: 30, right: 30, bottom: 60, left: 100 }}
                axisTop={null}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: '',
                  legendPosition: 'middle',
                  legendOffset: -40,
                }}
                axisBottom={{
                  tickRotation: -30,
                  tickPadding: 10,
                }}
                borderRadius={4}
                borderWidth={1}
                borderColor={nivoTheme.background}
                enableLabels={false}
                hoverTarget="cell"
              />
            </Deferred>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
