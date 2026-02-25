import { Button, Card, Chip } from '@heroui/react'
import { Calendar } from 'lucide-react'
import { Progress } from '../ui/Progress'
import { fmt, GOAL_TYPE_COLOR, RISK_COLOR } from './goalUtils'
import type { Goal } from '../../types/entities'

interface GoalCardProps {
  goal: Goal
  onSelect: (goal: Goal) => void
  now: number
}

export function GoalCard({ goal, onSelect, now }: GoalCardProps) {
  const pct = (goal.currentAmount / goal.targetAmount) * 100
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - now) / (1000 * 60 * 60 * 24))

  return (
    <Button variant="ghost" className="text-left w-full p-0 h-full" onPress={() => onSelect(goal)}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow h-full w-full">
        <Card.Header className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm leading-tight">{goal.name}</p>
            <div className="flex gap-1">
              <Chip size="sm" color={GOAL_TYPE_COLOR[goal.type]} variant="soft">
                {goal.type.replace('_', ' ')}
              </Chip>
              <Chip size="sm" color={RISK_COLOR[goal.riskProfile]} variant="secondary">
                {goal.riskProfile}
              </Chip>
            </div>
          </div>
        </Card.Header>
        <Card.Content className="py-3 flex flex-col gap-2">
          <Progress
            value={pct}
            color={pct >= 100 ? 'success' : 'primary'}
            size="md"
            showValueLabel
            label={`${fmt(goal.currentAmount)} / ${fmt(goal.targetAmount)}`}
          />
        </Card.Content>
        <Card.Footer className="flex items-center justify-between">
          <span className="text-xs text-foreground-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(goal.deadline).toLocaleDateString()}
          </span>
          <Chip
            size="sm"
            variant="soft"
            color={daysLeft < 30 ? 'danger' : daysLeft < 90 ? 'warning' : 'default'}
          >
            {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
          </Chip>
        </Card.Footer>
      </Card>
    </Button>
  )
}
