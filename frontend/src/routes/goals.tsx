import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Button, Card, Skeleton } from '@heroui/react'
import { Plus, Target } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { goalsStore } from '../store/goalsStore'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalDetailModal } from '../components/goals/GoalDetailModal'
import { AddGoalModal } from '../components/goals/AddGoalModal'
import type { Goal } from '../types/entities'

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
})

const PAGE_LOAD_TIME = Date.now()

function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const goals = useStore(goalsStore, (s) => s.data)
  const isLoading = useStore(goalsStore, (s) => s.status === 'idle' || s.status === 'loading')
  const hasError = useStore(goalsStore, (s) => s.status === 'error')
  const sorted = useMemo(
    () =>
      goals.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [goals],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground-400">
          {isLoading ? 'Loading…' : `${goals.length} goals`}
        </h2>
        <Button variant="primary" size="sm" onPress={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Goal
        </Button>
      </div>

      {hasError ? (
        <Card>
          <Card.Content className="flex flex-col items-center gap-3 py-12">
            <p className="text-danger text-sm">Failed to load goals. Please try again.</p>
          </Card.Content>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <Card.Content className="flex flex-col items-center gap-3 py-12">
            <Target className="w-10 h-10 text-foreground-300" />
            <p className="text-foreground-400 text-sm">No goals yet. Create your first goal!</p>
            <Button variant="primary" size="sm" onPress={() => setAddOpen(true)}>
              Add Goal
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onSelect={setSelectedGoal} now={PAGE_LOAD_TIME} />
          ))}
        </div>
      )}

      {selectedGoal && (
        <GoalDetailModal goal={selectedGoal} isOpen onClose={() => setSelectedGoal(null)} />
      )}
      <AddGoalModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
