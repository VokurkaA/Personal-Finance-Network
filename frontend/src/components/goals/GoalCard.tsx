import { Chip } from '@heroui/react'
import { cardVariants } from '@heroui/styles'
import { Calendar, PiggyBank, TrendingUp, Banknote, Clock } from 'lucide-react'
import { fmt, GOAL_TYPE_COLOR, RISK_COLOR } from './goalUtils'
import type { Goal } from '../../types/entities'

interface GoalCardProps {
  goal: Goal
  onSelect: (goal: Goal) => void
  now: number
}

const TYPE_ICONS: Record<Goal['type'], React.ReactNode> = {
  savings: <PiggyBank className="w-4 h-4" />,
  investment: <TrendingUp className="w-4 h-4" />,
  debt_payoff: <Banknote className="w-4 h-4" />,
}

export function GoalCard({ goal, onSelect, now }: GoalCardProps) {
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - now) / (1000 * 60 * 60 * 24))
  const slots = cardVariants()

  const isOverdue = daysLeft <= 0
  const isUrgent = daysLeft > 0 && daysLeft < 30

  return (
    <button
      className={`${slots.base()} text-left w-full cursor-pointer hover:shadow-lg transition-all h-full border-none p-0 bg-content1 group overflow-hidden flex flex-col`}
      onClick={() => onSelect(goal)}
      aria-label={`View details for ${goal.name}`}
    >
      {/* Visual progress indicator at the very top */}
      <div className="h-1.5 w-full bg-default-100 shrink-0">
        <div
          className={`h-full transition-all duration-700 ease-out ${pct >= 100 ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h3 className="font-black text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {goal.name}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                size="sm"
                variant="soft"
                color={GOAL_TYPE_COLOR[goal.type]}
                className="h-5 px-2"
              >
                <div className="flex items-center gap-1">
                  {TYPE_ICONS[goal.type]}
                  <Chip.Label className="text-[9px] uppercase font-black tracking-widest">
                    {goal.type.replace('_', ' ')}
                  </Chip.Label>
                </div>
              </Chip>
              <Chip
                size="sm"
                variant="secondary"
                color={RISK_COLOR[goal.riskProfile]}
                className="h-5 px-2 border-none"
              >
                <Chip.Label className="text-[9px] uppercase font-black tracking-widest">
                  {goal.riskProfile} Risk
                </Chip.Label>
              </Chip>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 pt-1">
            <span className="text-xl font-black leading-none text-primary">{Math.round(pct)}%</span>
            <span className="text-[9px] text-foreground-400 font-bold uppercase tracking-tighter">
              Complete
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-4 bg-default-50 p-3 rounded-xl border border-divider">
            <div className="flex flex-col">
              <span className="text-[9px] text-foreground-400 font-black uppercase tracking-widest mb-0.5">
                Saved
              </span>
              <span className="text-base font-black leading-none">{fmt(goal.currentAmount)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-foreground-400 font-black uppercase tracking-widest mb-0.5">
                Goal
              </span>
              <span className="text-sm font-bold text-foreground-500 leading-none">
                {fmt(goal.targetAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-foreground-400">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold">
                {new Date(goal.deadline).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <Chip
              size="sm"
              variant={isOverdue || isUrgent ? 'primary' : 'soft'}
              color={isOverdue ? 'danger' : isUrgent ? 'warning' : 'default'}
              className="h-7 px-3"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <Chip.Label className="text-[10px] font-black uppercase tracking-tight">
                  {isOverdue ? 'Overdue' : `${daysLeft} days`}
                </Chip.Label>
              </div>
            </Chip>
          </div>
        </div>
      </div>
    </button>
  )
}
