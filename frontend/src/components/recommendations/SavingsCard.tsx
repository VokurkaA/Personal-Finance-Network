import { Card, Chip, Button } from '@heroui/react'
import { ArrowRight } from 'lucide-react'
import type { SavingsRecommendation } from '../../types/api'
import { fmt, PRIORITY_COLOR } from './recommendationUtils'

export function SavingsCard({ rec }: { rec: SavingsRecommendation }) {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm leading-tight">{rec.title}</p>
          <Chip size="sm" color={PRIORITY_COLOR[rec.priority]} variant="soft" className="shrink-0">
            {rec.priority}
          </Chip>
        </div>
        <p className="text-xs text-foreground-400">{rec.suggestion}</p>
        {rec.services && rec.services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rec.services.map((s) => (
              <Chip key={s.name} size="sm" variant="secondary" color="default">
                {s.name}: {fmt(s.amount)}/mo
              </Chip>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-400">Current spending</p>
            <p className="font-medium text-sm">{fmt(rec.currentSpending)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground-400">Potential savings</p>
            <p className="font-bold text-success">{fmt(rec.potentialSavings)}</p>
          </div>
          <Button size="sm" variant="ghost">
            Apply <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
