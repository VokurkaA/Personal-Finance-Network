import { Card, Chip, Button, toast } from '@heroui/react'
import { ArrowRight } from 'lucide-react'
import type { InvestmentRecommendation } from '../../types/api'
import { RISK_COLOR } from './recommendationUtils'

export function InvestmentCard({ rec }: { rec: InvestmentRecommendation }) {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm">{rec.asset}</p>
          <Chip size="sm" color={RISK_COLOR[rec.risk]} variant="soft" className="shrink-0">
            {rec.risk} risk
          </Chip>
        </div>
        <p className="text-xs text-foreground-400">{rec.reason}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-400">Expected return</p>
            <p className="font-bold text-success">+{(rec.expectedReturn * 100).toFixed(1)}%</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => toast.info(`Opening details for ${rec.asset}`)}
          >
            Explore <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
