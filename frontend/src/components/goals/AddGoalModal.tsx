import { useState } from 'react'
import { Button, Input, Label, ListBox, Modal, Select, TextField } from '@heroui/react'
import { useCreateGoal } from '../../queries/useGoals'
import type { Goal } from '../../types/entities'
import { AppDatePicker } from '../ui/AppDatePicker'

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const { mutate: createGoal, isPending } = useCreateGoal()
  const [form, setForm] = useState({
    name: '',
    type: 'savings' as Goal['type'],
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    riskProfile: 'medium' as Goal['riskProfile'],
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
      { onSuccess: onClose },
    )
  }

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()} variant="blur">
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>New Goal</Modal.Heading>
          </Modal.Header>
          <form onSubmit={handleSubmit}>
            <Modal.Body className="flex flex-col gap-4">
              <TextField isRequired name="goal-name" variant="secondary">
                <Label>Goal Name</Label>
                <Input
                  placeholder="e.g. Emergency Fund"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  variant="secondary"
                />
              </TextField>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  aria-label="Goal type"
                  value={form.type}
                  onChange={(key) => setField('type', key as Goal['type'])}
                  variant="secondary"
                >
                  <Label>Type</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="savings" textValue="Savings">
                        Savings
                      </ListBox.Item>
                      <ListBox.Item id="investment" textValue="Investment">
                        Investment
                      </ListBox.Item>
                      <ListBox.Item id="debt_payoff" textValue="Debt Payoff">
                        Debt Payoff
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  aria-label="Risk profile"
                  value={form.riskProfile}
                  onChange={(key) => setField('riskProfile', key as Goal['riskProfile'])}
                  variant="secondary"
                >
                  <Label>Risk Profile</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="low" textValue="Low">
                        Low
                      </ListBox.Item>
                      <ListBox.Item id="medium" textValue="Medium">
                        Medium
                      </ListBox.Item>
                      <ListBox.Item id="high" textValue="High">
                        High
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextField isRequired name="target-amount" type="number" variant="secondary">
                  <Label>Target Amount ($)</Label>
                  <Input
                    placeholder="10000"
                    value={form.targetAmount}
                    onChange={(e) => setField('targetAmount', e.target.value)}
                    min={1}
                    variant="secondary"
                  />
                </TextField>

                <TextField name="current-amount" type="number" variant="secondary">
                  <Label>Current Amount ($)</Label>
                  <Input
                    placeholder="0"
                    value={form.currentAmount}
                    onChange={(e) => setField('currentAmount', e.target.value)}
                    min={0}
                    variant="secondary"
                  />
                </TextField>
              </div>

              <AppDatePicker
                label="Deadline"
                value={form.deadline || undefined}
                onChange={(val) => setField('deadline', val ?? '')}
                required
                variant="secondary"
              />
            </Modal.Body>
            <Modal.Footer className="mt-4">
              <Button variant="ghost" size="sm" type="button" onPress={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isPending={isPending}>
                Create Goal
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
