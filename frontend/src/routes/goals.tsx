import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Card, Chip, Skeleton, Button, Input, ModalRoot, ModalBackdrop, ModalContainer, ModalDialog, ModalHeader, ModalBody, ModalFooter } from "@heroui/react"
import { ResponsiveLine } from "@nivo/line"
import { Plus, Target, Calendar, TrendingUp } from "lucide-react"
import { useGoals, useGoalForecast, useGoalContributions, useCreateGoal } from "../queries/useGoals"
import { useTheme } from "../context/ThemeContext"
import { getNivoTheme, CHART_COLORS } from "../config/nivoTheme"
import { Progress } from "../components/ui/Progress"
import type { Goal } from "../types/entities"

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
})

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

const GOAL_TYPE_COLOR = {
  savings: "success",
  investment: "accent",
  debt_payoff: "warning",
} as const

const RISK_COLOR = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const

function GoalDetailModal({ goal, isOpen, onClose }: { goal: Goal; isOpen: boolean; onClose: () => void }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const nivoTheme = getNivoTheme(isDark)

  const { data: forecast, isLoading: forecastLoading } = useGoalForecast(goal.id)
  const { data: contributions = [], isLoading: contribLoading } = useGoalContributions(goal.id)

  const today = new Date()
  const deadline = new Date(goal.deadline)
  const monthsLeft = Math.max(
    Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)),
    1
  )
  const lineData = [
    {
      id: "Projected",
      data: Array.from({ length: monthsLeft + 1 }, (_, i) => {
        const d = new Date(today)
        d.setMonth(d.getMonth() + i)
        const projected = goal.currentAmount + ((goal.targetAmount - goal.currentAmount) / monthsLeft) * i
        return { x: d.toISOString().slice(0, 7), y: Math.round(projected) }
      }),
      color: CHART_COLORS[0],
    },
    {
      id: "Target",
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
              <span className="text-foreground-400">{fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}</span>
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
                <p className="font-semibold text-sm">{new Date(forecast.estimatedDate).toLocaleDateString()}</p>
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
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: goal.targetAmount * 1.05 }}
              curve="monotoneX"
              enablePoints={false}
              enableArea
              areaOpacity={0.1}
              axisBottom={{ tickRotation: -30, tickValues: 4 }}
              axisLeft={{ format: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
              enableGridX={false}
              legends={[
                {
                  anchor: "top-right",
                  direction: "row",
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
                      <p className="text-xs text-foreground-400">{new Date(c.contributedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-success">+{fmt(c.transaction.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onPress={onClose}>Close</Button>
        </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  )
}

function AddGoalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { mutate: createGoal, isPending } = useCreateGoal()
  const [form, setForm] = useState({
    name: "",
    type: "savings" as Goal["type"],
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
    riskProfile: "medium" as Goal["riskProfile"],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.targetAmount || !form.deadline) return
    createGoal(
      {
        name: form.name,
        type: form.type,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount),
        deadline: form.deadline,
        riskProfile: form.riskProfile,
      },
      { onSuccess: onClose }
    )
  }

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  return (
    <ModalRoot isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="lg">
          <ModalDialog>
        <form onSubmit={handleSubmit}>
          <ModalHeader>New Goal</ModalHeader>
          <ModalBody className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Goal Name</label>
              <Input
                placeholder="e.g. Emergency Fund"
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">Type</label>
                <select
                  className="border border-divider rounded-lg bg-background text-foreground text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value as Goal["type"])}
                >
                  <option value="savings">Savings</option>
                  <option value="investment">Investment</option>
                  <option value="debt_payoff">Debt Payoff</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">Risk Profile</label>
                <select
                  className="border border-divider rounded-lg bg-background text-foreground text-sm px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                  value={form.riskProfile}
                  onChange={(e) => setField("riskProfile", e.target.value as Goal["riskProfile"])}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">Target Amount ($)</label>
                <Input
                  type="number"
                  placeholder="10000"
                  required
                  value={form.targetAmount}
                  onChange={(e) => setField("targetAmount", e.target.value)}
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">Current Amount ($)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.currentAmount}
                  onChange={(e) => setField("currentAmount", e.target.value)}
                  min={0}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Deadline</label>
              <Input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setField("deadline", e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="sm" type="button" onPress={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isDisabled={isPending}>{isPending ? "Saving…" : "Create Goal"}</Button>
          </ModalFooter>
        </form>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  )
}

function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const { data: goals = [], isLoading } = useGoals()

  const sorted = goals
    .slice()
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground-400">
          {isLoading ? "Loading…" : `${goals.length} goals`}
        </h2>
        <Button variant="primary" size="sm" onPress={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <Card.Content className="flex flex-col items-center gap-3 py-12">
            <Target className="w-10 h-10 text-foreground-300" />
            <p className="text-foreground-400 text-sm">No goals yet. Create your first goal!</p>
            <Button variant="primary" size="sm" onPress={() => setAddOpen(true)}>Add Goal</Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((goal) => {
            const pct = (goal.currentAmount / goal.targetAmount) * 100
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - now) / (1000 * 60 * 60 * 24)
            )
            return (
              <button
                key={goal.id}
                className="text-left"
                onClick={() => setSelectedGoal(goal)}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                  <Card.Header className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-sm leading-tight">{goal.name}</p>
                      <div className="flex gap-1">
                        <Chip size="sm" color={GOAL_TYPE_COLOR[goal.type]} variant="soft">
                          {goal.type.replace("_", " ")}
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
                      color={pct >= 100 ? "success" : "primary"}
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
                      color={daysLeft < 30 ? "danger" : daysLeft < 90 ? "warning" : "default"}
                    >
                      {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
                    </Chip>
                  </Card.Footer>
                </Card>
              </button>
            )
          })}
        </div>
      )}

      {selectedGoal && (
        <GoalDetailModal
          goal={selectedGoal}
          isOpen={Boolean(selectedGoal)}
          onClose={() => setSelectedGoal(null)}
        />
      )}

      <AddGoalModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
