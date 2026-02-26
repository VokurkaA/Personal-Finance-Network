import { createLazyFileRoute } from '@tanstack/react-router'
import { Card, Skeleton, Accordion } from '@heroui/react'
import { PiggyBank, TrendingUp, SlidersHorizontal, Lightbulb } from 'lucide-react'
import {
  useSavingsRecommendations,
  useInvestmentRecommendations,
  useBudgetAdjustment,
} from '../queries/useRecommendations'
import { fmt } from '../components/recommendations/recommendationUtils'
import { SavingsCard } from '../components/recommendations/SavingsCard'
import { InvestmentCard } from '../components/recommendations/InvestmentCard'
import { BudgetAdjustCard } from '../components/recommendations/BudgetAdjustCard'
import { AccordionSection } from '../components/recommendations/AccordionSection'

export const Route = createLazyFileRoute('/recommendations')({
  component: RecommendationsPage,
})

function RecommendationsPage() {
  const { data: savingsData, isLoading: savingsLoading } = useSavingsRecommendations()
  const savings = savingsData?.recommendations ?? []
  const totalPotentialSavings = savingsData?.totalPotentialSavings ?? 0

  const { data: investments = [], isLoading: investLoading } = useInvestmentRecommendations()
  const { data: budgetAdjustments = [], isLoading: adjustLoading } = useBudgetAdjustment('all')

  return (
    <div className="flex flex-col gap-6">
      {!savingsLoading && totalPotentialSavings > 0 && (
        <Card className="border border-primary/20 bg-primary/5">
          <Card.Content className="flex flex-row items-center gap-3 p-4">
            <Lightbulb className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                You could save up to{' '}
                <span className="text-primary">{fmt(totalPotentialSavings)}</span> per month
              </p>
              <p className="text-xs text-foreground-400">
                Based on your spending patterns and budget analysis
              </p>
            </div>
          </Card.Content>
        </Card>
      )}

      <Accordion
        allowsMultipleExpanded
        defaultExpandedKeys={['savings', 'investments', 'budget']}
        className="flex flex-col gap-2"
      >
        <AccordionSection
          id="savings"
          icon={<PiggyBank className="w-4 h-4 text-success" />}
          title="Savings Opportunities"
          count={savings.length}
          isLoading={savingsLoading}
        >
          {savingsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : savings.length === 0 ? (
            <p className="text-sm text-foreground-400">No savings recommendations at this time</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savings.map((rec) => (
                <SavingsCard key={rec.title} rec={rec} />
              ))}
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : investments.length === 0 ? (
            <p className="text-sm text-foreground-400">No investment recommendations available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investments.map((rec) => (
                <InvestmentCard key={rec.asset} rec={rec} />
              ))}
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : budgetAdjustments.length === 0 ? (
            <p className="text-sm text-foreground-400">No budget adjustments suggested</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {budgetAdjustments.map((rec) => (
                <BudgetAdjustCard key={rec.category} rec={rec} />
              ))}
            </div>
          )}
        </AccordionSection>
      </Accordion>
    </div>
  )
}
