import { Card, Chip, Skeleton } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { useAnomalies } from '../../queries/useAnalytics'

interface AnomalyListCardProps {
  sensitivity?: number
}

export function AnomalyListCard({ sensitivity = 0.9 }: AnomalyListCardProps) {
  const { data: anomalyData, isLoading } = useAnomalies(sensitivity)
  const anomalies = anomalyData?.anomalies ?? []

  return (
    <Card>
      <Card.Header className="pb-0 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <Card.Title>Anomaly Detection</Card.Title>
        {!isLoading && (
          <Chip size="sm" color="warning" variant="soft" className="ml-auto">
            <Chip.Label>{anomalies.length} detected</Chip.Label>
          </Chip>
        )}
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded" />
            ))}
          </div>
        ) : anomalies.length === 0 ? (
          <p className="text-sm text-foreground-400 text-center py-4">No anomalies detected</p>
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
                      <Chip.Label>Score: {(a.anomalyScore * 100).toFixed(0)}%</Chip.Label>
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
  )
}
