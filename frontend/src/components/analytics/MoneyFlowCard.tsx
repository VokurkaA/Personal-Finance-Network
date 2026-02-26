import { Card, Skeleton } from '@heroui/react'
import { BarChart2 } from 'lucide-react'
import { ResponsiveSankey } from '@nivo/sankey'
import { useSpendingFlow } from '../../queries/useAnalytics'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../../config/nivoTheme'
import type { SpendingFlowResponse } from '../../types/api'

function buildSankeyData(flow: SpendingFlowResponse) {
  return {
    nodes: flow.nodes.map((n) => ({ id: n.id, label: n.label })),
    links: flow.edges.map((e) => ({ source: e.from, target: e.to, value: e.amount })),
  }
}

export function MoneyFlowCard({ month }: { month: string }) {
  const { theme } = useTheme()
  const nivoTheme = getNivoTheme(theme === 'dark')

  const { data: flow, isLoading: flowLoading } = useSpendingFlow(month)

  const sankeyData = flow ? buildSankeyData(flow) : null

  return (
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
  )
}
