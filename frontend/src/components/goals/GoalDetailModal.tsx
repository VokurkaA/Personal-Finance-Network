import {
  Button,
  Skeleton,
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import { ResponsiveLine } from '@nivo/line'
import { Target, Calendar, TrendingUp } from 'lucide-react'
import { useGoalForecast, useGoalContributions } from '../../queries/useGoals'
import { useStore } from '@tanstack/react-store'
import { goalsStore } from '../../store/goalsStore'
import { useTheme } from '../../context/ThemeContext'
import { getNivoTheme, CHART_COLORS } from '../../config/nivoTheme'
import { Progress } from '../ui/Progress'
import { fmt } from './goalUtils'
import type { Goal } from '../../types/entities'

interface GoalDetailModalProps {
  goal: Goal
  isOpen: boolean
  onClose: () => void
}

export function GoalDetailModal({ goal, isOpen, onClose }: GoalDetailModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nivoTheme = getNivoTheme(isDark)

  const { isLoading: forecastLoading } = useGoalForecast(goal.id)
  const forecast = useStore(goalsStore, (s) => s.forecasts[goal.id])
  const { isLoading: contribLoading } = useGoalContributions(goal.id)
  const contributions = useStore(goalsStore, (s) => s.contributions[goal.id] ?? [])

  const today = new Date()
  const deadline = new Date(goal.deadline)
  const monthsLeft = Math.max(
    Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)),
    1,
  )

  const lineData = [
    {
      id: 'Projected',
      data: Array.from({ length: monthsLeft + 1 }, (_, i) => {
        const d = new Date(today)
        d.setMonth(d.getMonth() + i)
        const projected =
          goal.currentAmount + ((goal.targetAmount - goal.currentAmount) / monthsLeft) * i
        return { x: d.toISOString().slice(0, 7), y: Math.round(projected) }
      }),
      color: CHART_COLORS[0],
    },
    {
      id: 'Target',
      data: [
        { x: today.toISOString().slice(0, 7), y: goal.targetAmount },
        { x: deadline.toISOString().slice(0, 7), y: goal.targetAmount },
      ],
      color: CHART_COLORS[4],
    },
  ]

  return (
    <ModalRoot isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="lg">
          <ModalDialog>
            <ModalHeader>
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {goal.name}
              </span>
            </ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-foreground-400">
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
                <Skeleton className="h-16 w-full rounded" />
              ) : forecast ? (
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-content2 rounded-xl flex flex-col items-center">
                    <Calendar className="w-4 h-4 text-foreground-400 mb-1" />
                    <p className="text-xs text-foreground-400">Est. Completion</p>
                    <p className="font-semibold text-sm">
                      {new Date(forecast.estimatedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-1 p-3 bg-content2 rounded-xl flex flex-col items-center">
                    <TrendingUp className="w-4 h-4 text-foreground-400 mb-1" />
                    <p className="text-xs text-foreground-400">Required Monthly</p>
                    <p className="font-semibold text-sm">{fmt(forecast.requiredMonthlyAmount)}</p>
                  </div>
                </div>
              ) : null}

              <div className="h-40">
                <ResponsiveLine
                  data={lineData}
                  theme={nivoTheme}
                  colors={[CHART_COLORS[0], CHART_COLORS[4]]}
                  margin={{ top: 10, right: 20, bottom: 40, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 0, max: goal.targetAmount * 1.05 }}
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

              <div>
                <p className="text-sm font-semibold mb-2">Contributions</p>
                {contribLoading ? (
                  <Skeleton className="h-24 w-full rounded" />
                ) : contributions.length === 0 ? (
                  <p className="text-sm text-foreground-400">No contributions yet</p>
                ) : (
                  <div className="flex flex-col divide-y divide-divider max-h-48 overflow-y-auto">
                    {contributions.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{c.transaction.description}</p>
                          <p className="text-xs text-foreground-400">
                            {new Date(c.contributedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-success">
                          +{fmt(c.transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" size="sm" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  )
}
