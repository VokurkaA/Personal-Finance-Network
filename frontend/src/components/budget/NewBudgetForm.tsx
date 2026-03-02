import { useState, useEffect, useRef } from 'react'
import { Button, Input, Label } from '@heroui/react'
import { Save, Loader2 } from 'lucide-react'
import { useCreateBudget } from '../../queries/useBudget'
import { useCategories } from '../../queries/useCategories'

interface NewBudgetFormProps {
  month: string
  onSuccess: () => void
}

export function NewBudgetForm({ month, onSuccess }: NewBudgetFormProps) {
  const { mutate: createBudget, isPending } = useCreateBudget()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const [amounts, setAmounts] = useState<Record<string, string>>({})

  // Use a ref to ensure we only initialize default amounts once
  const initializedRef = useRef(false)

  // Initialize amounts when categories are loaded
  useEffect(() => {
    if (categories && !initializedRef.current) {
      // We only want expense categories for the budget usually
      const expenseCategories = categories.filter((c) => c.type === 'expense')
      setAmounts((prev) => {
        const next = { ...prev }
        expenseCategories.forEach((cat) => {
          if (next[cat.name] === undefined) {
            next[cat.name] = cat.budget ? String(cat.budget) : ''
          }
        })
        return next
      })
      initializedRef.current = true
    }
  }, [categories])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const budgetCategories = Object.entries(amounts)
      .filter(([, v]) => v !== '' && Number(v) > 0)
      .map(([category, budgetAmount]) => ({
        category,
        budgetAmount: Number(budgetAmount),
      }))
    if (budgetCategories.length === 0) return
    createBudget({ month, categories: budgetCategories, notes: '' }, { onSuccess })
  }

  if (categoriesLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-foreground-400">Loading categories...</p>
      </div>
    )
  }

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || []

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-foreground-400">
        Set monthly budget limits for each category. Pre-filled with category defaults.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {expenseCategories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-1">
            <Label className="text-xs font-medium">{cat.name}</Label>
            <Input
              type="number"
              placeholder="0"
              value={amounts[cat.name] || ''}
              onChange={(e) => setAmounts((prev) => ({ ...prev, [cat.name]: e.target.value }))}
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
