import { Button, Skeleton, Modal } from '@heroui/react'
import { ResponsiveLine } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import { Target, Calendar, TrendingUp } from 'lucide-react'
import { useGoalForecast, useGoalContributions } from '../../queries/useGoals'
import { useResolvedChartTheme } from '../../config/nivoTheme'
import { Progress } from '../ui/Progress'
import { Deferred } from '../ui/Deferred'
import { fmt } from './goalUtils'
import type { Goal } from '../../types/entities'
import { memo, useMemo } from 'react'

interface GoalDetailModalProps {
  goal: Goal
  isOpen: boolean
  onClose: () => void
}

const Chart = memo(
  ({
    lineData,
    theme,
    targetAmount,
    colors,
  }: {
    lineData: { id: string; data: { x: string; y: number }[] }[]
    theme: PartialTheme
    targetAmount: number
    colors: string[]
  }) => (
    <div className="h-48 w-full">
      <ResponsiveLine
        data={lineData}
        theme={theme}
        colors={colors}
        margin={{ top: 10, right: 20, bottom: 40, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: targetAmount * 1.05 }}
        curve="monotoneX"
        enablePoints={false}
        enableArea
        areaOpacity={0.1}
        axisBottom={{ tickRotation: -30, tickValues: 4 }}
        axisLeft={{ format: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
        enableGridX={false}
        legends={[
          {
            anchor: 'top-right',
            direction: 'row',
            translateY: -16,
            itemWidth: 90,
            itemHeight: 16,
            symbolSize: 8,
          },
        ]}
      />
    </div>
  ),
)

Chart.displayName = 'GoalChart'

export function GoalDetailModal({ goal, isOpen, onClose }: GoalDetailModalProps) {
  const { theme: nivoTheme, colors, danger } = useResolvedChartTheme()

  const { data: forecast, isLoading: forecastLoading } = useGoalForecast(goal.id)
  const { data: contributions = [], isLoading: contribLoading } = useGoalContributions(goal.id)

  const lineData = useMemo(() => {
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const monthsLeft = Math.max(
      Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)),
      1,
    )
    return [
      {
        id: 'Projected',
        data: Array.from({ length: monthsLeft + 1 }, (_, i) => {
          const d = new Date(today)
          d.setMonth(d.getMonth() + i)
          const projected =
            goal.currentAmount + ((goal.targetAmount - goal.currentAmount) / monthsLeft) * i
          return { x: d.toISOString().slice(0, 7), y: Math.round(projected) }
        }),
      },
      {
        id: 'Target',
        data: [
          { x: today.toISOString().slice(0, 7), y: goal.targetAmount },
          { x: deadline.toISOString().slice(0, 7), y: goal.targetAmount },
        ],
      },
    ]
  }, [goal.currentAmount, goal.targetAmount, goal.deadline])

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()} variant="blur">
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {goal.name}
              </div>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-foreground-500 uppercase tracking-tight">
                  Progress
                </span>
                <span className="font-black text-primary">
                  {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}
                </span>
              </div>
              <Progress
                value={(goal.currentAmount / goal.targetAmount) * 100}
                color="primary"
                showValueLabel
                size="lg"
              />
            </div>

            {forecastLoading ? (
              <Skeleton className="h-20 w-full rounded-2xl" />
            ) : forecast ? (
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-default-100 rounded-2xl flex flex-col items-center gap-1">
                  <Calendar className="w-5 h-5 text-primary" />
                  <p className="text-[10px] text-foreground-400 text-center font-bold uppercase tracking-widest">
                    Est. Completion
                  </p>
                  <p className="font-bold text-base">
                    {new Date(forecast.estimatedDate).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex-1 p-4 bg-default-100 rounded-2xl flex flex-col items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <p className="text-[10px] text-foreground-400 text-center font-bold uppercase tracking-widest">
                    Required Monthly
                  </p>
                  <p className="font-bold text-base">{fmt(forecast.requiredMonthlyAmount)}</p>
                </div>
              </div>
            ) : null}

            <div className="bg-default-50 rounded-2xl p-4 border border-divider">
              <Deferred fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
                <Chart
                  lineData={lineData}
                  theme={nivoTheme}
                  targetAmount={goal.targetAmount}
                  colors={[colors[0], danger]}
                />
              </Deferred>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-foreground-400">
                History
              </p>
              {contribLoading ? (
                <Skeleton className="h-32 w-full rounded-2xl" />
              ) : contributions.length === 0 ? (
                <div className="bg-default-100/50 p-8 rounded-2xl text-center text-sm text-foreground-400 italic">
                  No contributions recorded yet.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-divider max-h-60 overflow-y-auto bg-default-50 rounded-2xl border border-divider px-4">
                  {contributions.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{c.transaction.description}</p>
                        <p className="text-[10px] text-foreground-400 font-medium">
                          {new Date(c.contributedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-black text-success shrink-0 ml-4">
                        +{fmt(c.transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onPress={onClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
