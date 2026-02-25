import { createFileRoute } from "@tanstack/react-router"
import { Card, Chip, Skeleton, Button, Accordion } from "@heroui/react"
import {
  PiggyBank,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  Lightbulb,
  ChevronDown,
} from "lucide-react"
import {
  useSavingsRecommendations,
  useInvestmentRecommendations,
  useBudgetAdjustment,
} from "../queries/useRecommendations"
import type { SavingsRecommendation, InvestmentRecommendation, BudgetAdjustmentSuggestion } from "../types/api"

export const Route = createFileRoute("/recommendations")({
  component: RecommendationsPage,
})

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

const PRIORITY_COLOR = {
  high: "danger",
  medium: "warning",
  low: "default",
} as const

const RISK_COLOR = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const

function SavingsCard({ rec }: { rec: SavingsRecommendation }) {
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

function InvestmentCard({ rec }: { rec: InvestmentRecommendation }) {
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
          <Button size="sm" variant="ghost">
            Explore <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}

function BudgetAdjustCard({ rec }: { rec: BudgetAdjustmentSuggestion }) {
  const diff = rec.suggestedBudget - rec.currentBudget
  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm">{rec.category}</p>
          <Chip
            size="sm"
            color={diff > 0 ? "danger" : "success"}
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
          <Button size="sm" variant="ghost">
            Apply <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}

function AccordionSection({
  id,
  icon,
  title,
  count,
  isLoading,
  children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  count: number
  isLoading: boolean
  children: React.ReactNode
}) {
  return (
    <Accordion.Item id={id}>
      <Accordion.Heading>
        <Accordion.Trigger className="flex w-full items-center justify-between py-3 px-4 text-left font-medium hover:bg-content2 transition-colors rounded-lg">
          <span className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold">{title}</span>
            {!isLoading && (
              <Chip size="sm" variant="soft" color="default">{count}</Chip>
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-foreground-400 transition-transform data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body className="px-2 pb-4">
          {children}
        </Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  )
}

function RecommendationsPage() {
  const { data: savingsData, isLoading: savingsLoading } = useSavingsRecommendations()
  const { data: investments = [], isLoading: investLoading } = useInvestmentRecommendations()
  const { data: budgetAdjustments = [], isLoading: adjustLoading } = useBudgetAdjustment()

  const savings = savingsData?.recommendations ?? []
  const totalPotentialSavings = savingsData?.totalPotentialSavings ?? 0

  return (
    <div className="flex flex-col gap-6">
      {!savingsLoading && totalPotentialSavings > 0 && (
        <Card className="border border-primary/20 bg-primary/5">
          <Card.Content className="flex flex-row items-center gap-3 p-4">
            <Lightbulb className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                You could save up to{" "}
                <span className="text-primary">{fmt(totalPotentialSavings)}</span> per month
              </p>
              <p className="text-xs text-foreground-400">
                Based on your spending patterns and budget analysis
              </p>
            </div>
          </Card.Content>
        </Card>
      )}

      <Accordion allowsMultipleExpanded defaultExpandedKeys={["savings", "investments", "budget"]} className="flex flex-col gap-2">
        <AccordionSection
          id="savings"
          icon={<PiggyBank className="w-4 h-4 text-success" />}
          title="Savings Opportunities"
          count={savings.length}
          isLoading={savingsLoading}
        >
          {savingsLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
            </div>
          ) : savings.length === 0 ? (
            <p className="text-sm text-foreground-400">No savings recommendations at this time</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savings.map((rec) => <SavingsCard key={rec.title} rec={rec} />)}
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          id="investments"
          icon={<TrendingUp className="w-4 h-4 text-accent" />}
          title="Investment Options"
          count={investments.length}
          isLoading={investLoading}
        >
          {investLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
            </div>
          ) : investments.length === 0 ? (
            <p className="text-sm text-foreground-400">No investment recommendations available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investments.map((rec) => <InvestmentCard key={rec.asset} rec={rec} />)}
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          id="budget"
          icon={<SlidersHorizontal className="w-4 h-4 text-warning" />}
          title="Budget Adjustments"
          count={budgetAdjustments.length}
          isLoading={adjustLoading}
        >
          {adjustLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
            </div>
          ) : budgetAdjustments.length === 0 ? (
            <p className="text-sm text-foreground-400">No budget adjustments suggested</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {budgetAdjustments.map((rec) => <BudgetAdjustCard key={rec.category} rec={rec} />)}
            </div>
          )}
        </AccordionSection>
      </Accordion>
    </div>
  )
}
