import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, Chip, Skeleton } from '@heroui/react'
import { ResponsiveSankey } from '@nivo/sankey'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { AlertTriangle, BarChart2 } from 'lucide-react'
import { useSpendingFlow } from '../../queries/useAnalytics'
import { useStore } from '@tanstack/react-store'
import { analyticsStore } from '../../store/analyticsStore'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../../config/nivoTheme'
import type { SpendingFlowResponse } from '../../types/api'

export const Route = createFileRoute('/analytics/')({
  component: AnalyticsIndexPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function buildSankeyData(flow: SpendingFlowResponse) {
  const nodes = flow.nodes.map((n) => ({ id: n.id, label: n.label }))
  const links = flow.edges.map((e) => ({
    source: e.from,
    target: e.to,
    value: e.amount,
  }))
  return { nodes, links }
}

type PatternRow = { id: string; data: { x: string; y: number }[] }

function AnalyticsIndexPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nivoTheme = getNivoTheme(isDark)

  const [month, setMonth] = useState(currentMonth())

  const { isLoading: flowLoading } = useSpendingFlow(month)
  const flow = useStore(analyticsStore, (s) => s.spendingFlow[month])
  const anomalyData = useStore(analyticsStore, (s) => s.anomalies[0.9])
  const anomalyLoading = !anomalyData
  const patternsRaw = useStore(analyticsStore, (s) => s.spendingPatterns[3])
  const patternsLoading = !patternsRaw

  const sankeyData = flow ? buildSankeyData(flow) : null
  const anomalies = anomalyData?.anomalies ?? []
  const patterns = (patternsRaw as PatternRow[] | undefined) ?? []

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex border-b border-divider">
        {[
          { to: '/analytics', label: 'Money Flow', exact: true },
          {
            to: '/analytics/spending',
            label: 'Spending Analysis',
            exact: false,
          },
        ].map(({ to, label, exact }) => (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
              exact
                ? pathname === to
                : pathname.startsWith(to)
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-400 hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-foreground-400 shrink-0">Month</label>
        <select
          className="border border-divider rounded-lg bg-background text-foreground text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none w-36"
          aria-label="Select month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <Card.Header className="pb-0 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <Card.Title>Money Flow — {month}</Card.Title>
        </Card.Header>
        <Card.Content>
          {flowLoading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : !sankeyData || sankeyData.nodes.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-foreground-400 text-sm">
              No flow data for {month}
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveSankey
                data={sankeyData}
                theme={nivoTheme}
                colors={CHART_COLORS}
                nodeOpacity={1}
                nodeThickness={18}
                nodeInnerPadding={3}
                nodeSpacing={24}
                nodeBorderWidth={0}
                linkOpacity={0.4}
                enableLinkGradient
                labelPosition="outside"
                labelOrientation="horizontal"
                labelPadding={16}
                margin={{ top: 10, right: 140, bottom: 10, left: 140 }}
              />
            </div>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="pb-0 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <Card.Title>Anomaly Detection</Card.Title>
          {!anomalyLoading && (
            <Chip size="sm" color="warning" variant="soft" className="ml-auto">
              {anomalies.length} detected
            </Chip>
          )}
        </Card.Header>
        <Card.Content>
          {anomalyLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded" />
              ))}
            </div>
          ) : anomalies.length === 0 ? (
            <p className="text-sm text-foreground-400">No anomalies detected</p>
          ) : (
            <div className="flex flex-col divide-y divide-divider">
              {anomalies.map((a) => (
                <div key={a.transactionId} className="py-3 flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{a.merchant}</p>
                      <p className="text-xs text-foreground-400">
                        {a.category} · {new Date(a.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-danger">
                        ${Math.abs(a.amount).toLocaleString()}
                      </span>
                      <Chip size="sm" color="warning" variant="soft">
                        Score: {(a.anomalyScore * 100).toFixed(0)}%
                      </Chip>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-400">{a.reason}</p>
                  {a.recommendation && <p className="text-xs text-primary">{a.recommendation}</p>}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="pb-0">
          <Card.Title>Spending Patterns (last 3 months)</Card.Title>
        </Card.Header>
        <Card.Content>
          {patternsLoading ? (
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
    </div>
  )
}
