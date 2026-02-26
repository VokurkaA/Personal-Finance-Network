import { useState } from 'react'
import {
  Button,
  Input,
  Label,
  ListBox,
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
} from '@heroui/react'
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
    <ModalRoot isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="lg">
          <ModalDialog>
            <form onSubmit={handleSubmit}>
              <ModalHeader>New Goal</ModalHeader>
              <ModalBody className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Goal Name</Label>
                  <Input
                    placeholder="e.g. Emergency Fund"
                    required
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Type</Label>
                    <Select
                      aria-label="Goal type"
                      selectedKey={form.type}
                      onSelectionChange={(key) => setField('type', key as Goal['type'])}
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="savings">Savings</ListBox.Item>
                          <ListBox.Item id="investment">Investment</ListBox.Item>
                          <ListBox.Item id="debt_payoff">Debt Payoff</ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Risk Profile</Label>
                    <Select
                      aria-label="Risk profile"
                      selectedKey={form.riskProfile}
                      onSelectionChange={(key) =>
                        setField('riskProfile', key as Goal['riskProfile'])
                      }
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="low">Low</ListBox.Item>
                          <ListBox.Item id="medium">Medium</ListBox.Item>
                          <ListBox.Item id="high">High</ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Target Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      required
                      value={form.targetAmount}
                      onChange={(e) => setField('targetAmount', e.target.value)}
                      min={1}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Current Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.currentAmount}
                      onChange={(e) => setField('currentAmount', e.target.value)}
                      min={0}
                    />
                  </div>
                </div>
                <AppDatePicker
                  label="Deadline"
                  value={form.deadline || undefined}
                  onChange={(val) => setField('deadline', val ?? '')}
                  required
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" size="sm" type="button" onPress={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isDisabled={isPending}>
                  {isPending ? 'Saving…' : 'Create Goal'}
                </Button>
              </ModalFooter>
            </form>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  )
}
