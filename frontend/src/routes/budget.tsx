import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, Skeleton, ListBox, Select } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { budgetsStore } from '../store/budgetsStore'
import { BudgetVsActualPanel } from '../components/budget/BudgetVsActualPanel'
import { NewBudgetForm } from '../components/budget/NewBudgetForm'
import { BudgetPlansList } from '../components/budget/BudgetPlansList'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const budgets = useStore(budgetsStore, (s) => s.data)
  const budgetsLoading = useStore(budgetsStore, (s) => s.status !== 'success')

  const currentBudget = budgets.find((b) => b.month === selectedMonth)

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card>
          <Card.Header className="flex items-center justify-between">
            <Card.Title>Budget Plan</Card.Title>
            <Select
              aria-label="Select month"
              value={selectedMonth}
              onChange={(key) => setSelectedMonth(key as string)}
              className="w-36"
              variant="secondary"
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {months.map((m) => (
                    <ListBox.Item key={m} id={m} textValue={m}>
                      {m}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </Card.Header>
          <Card.Content>
            {budgetsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            ) : currentBudget ? (
              <BudgetVsActualPanel budgetId={currentBudget.id} />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 p-3 bg-content2 rounded-xl">
                  <Plus className="w-4 h-4 text-foreground-400 shrink-0" />
                  <p className="text-sm text-foreground-400">
                    No budget plan for{' '}
                    <span className="font-medium text-foreground">{selectedMonth}</span>. Create one
                    below.
                  </p>
                </div>
                <NewBudgetForm month={selectedMonth} onSuccess={() => {}} />
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <Card.Header>
            <Card.Title>All Budget Plans</Card.Title>
          </Card.Header>
          <Card.Content>
            <BudgetPlansList
              budgets={budgets}
              isLoading={budgetsLoading}
              selectedMonth={selectedMonth}
              onSelect={setSelectedMonth}
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
