import { Card, Chip, Button, toast } from '@heroui/react'
import { ArrowRight } from 'lucide-react'
import type { BudgetAdjustmentSuggestion } from '../../types/api'
import { fmt } from './recommendationUtils'

export function BudgetAdjustCard({ rec }: { rec: BudgetAdjustmentSuggestion }) {
  const diff = rec.suggestedBudget - rec.currentBudget
  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm">{rec.category}</p>
          <Chip
            size="sm"
            color={diff > 0 ? 'danger' : 'success'}
            variant="soft"
            className="shrink-0"
          >
            {diff > 0 ? `+${fmt(diff)}` : fmt(diff)}
          </Chip>
        </div>
        <p className="text-xs text-foreground-400">{rec.reason}</p>
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs text-foreground-400">Current</p>
            <p className="font-medium">{fmt(rec.currentBudget)}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-foreground-400" />
          <div className="text-right">
            <p className="text-xs text-foreground-400">Suggested</p>
            <p className="font-bold">{fmt(rec.suggestedBudget)}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => toast.success(`Applied budget adjust for ${rec.category}`)}
          >
            Apply <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
