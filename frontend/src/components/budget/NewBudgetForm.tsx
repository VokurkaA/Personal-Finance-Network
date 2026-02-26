import { useState } from 'react'
import { Button, Input, Label } from '@heroui/react'
import { Save } from 'lucide-react'
import { useCreateBudget } from '../../queries/useBudget'

const DEFAULT_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Health',
  'Utilities',
  'Savings',
]

interface NewBudgetFormProps {
  month: string
  onSuccess: () => void
}

export function NewBudgetForm({ month, onSuccess }: NewBudgetFormProps) {
  const { mutate: createBudget, isPending } = useCreateBudget()
  const [amounts, setAmounts] = useState<Record<string, string>>(
    Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c, ''])),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const categories = Object.entries(amounts)
      .filter(([, v]) => v !== '' && Number(v) > 0)
      .map(([category, budgetAmount]) => ({
        category,
        budgetAmount: Number(budgetAmount),
      }))
    if (categories.length === 0) return
    createBudget({ month, categories, notes: '' }, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-foreground-400">
        Set monthly budget limits for each category. Leave blank to skip.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFAULT_CATEGORIES.map((cat) => (
          <div key={cat} className="flex flex-col gap-1">
            <Label className="text-xs font-medium">{cat}</Label>
            <Input
              type="number"
              placeholder="0"
              value={amounts[cat]}
              onChange={(e) => setAmounts((prev) => ({ ...prev, [cat]: e.target.value }))}
              min={0}
              variant="secondary"
            />
          </div>
        ))}
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        isPending={isPending}
        className="self-start"
      >
        <Save className="w-4 h-4 mr-1" />
        Create Budget Plan
      </Button>
    </form>
  )
}
