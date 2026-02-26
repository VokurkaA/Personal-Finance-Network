import { useRef } from 'react'
import { DatePicker, Calendar, Label } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import type { DateValue } from 'react-aria-components'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

interface AppDatePickerProps {
  label?: string
  value: string | undefined
  onChange: (val: string | undefined) => void
  required?: boolean
  /** Extra classes for the trigger button */
  className?: string
  variant?: 'primary' | 'secondary'
}

function fmt(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AppDatePicker({
  label,
  value,
  onChange,
  required,
  className,
  variant = 'primary',
}: AppDatePickerProps) {
  const parsed = value ? parseDate(value) : null
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex flex-col gap-1">
      {label && <Label className="text-xs font-medium">{label}</Label>}
      <DatePicker.Root
        value={parsed}
        onChange={(val: DateValue | null) => onChange(val?.toString() ?? undefined)}
        isRequired={required}
        aria-label={label ?? 'Date picker'}
      >
        <DatePicker.Trigger
          ref={triggerRef}
          className={`flex items-center gap-2 h-9 px-3 w-40 rounded-medium border border-divider text-sm
            hover:border-foreground-400 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
            ${variant === 'secondary' ? 'bg-surface-secondary shadow-none' : 'bg-surface shadow-sm'}
            ${className ?? ''}`}
        >
          <span className="flex-1 text-left truncate">
            {value ? fmt(value) : <span className="text-foreground-400">Pick a date</span>}
          </span>
          <DatePicker.TriggerIndicator>
            <CalendarDays className="w-4 h-4 text-foreground-400 shrink-0" />
          </DatePicker.TriggerIndicator>
        </DatePicker.Trigger>
        <DatePicker.Popover triggerRef={triggerRef}>
          <Calendar.Root>
            <Calendar.Header>
              <Calendar.NavButton slot="previous">
                <ChevronLeft className="w-4 h-4" />
              </Calendar.NavButton>
              <Calendar.Heading />
              <Calendar.NavButton slot="next">
                <ChevronRight className="w-4 h-4" />
              </Calendar.NavButton>
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
          </Calendar.Root>
        </DatePicker.Popover>
      </DatePicker.Root>
    </div>
  )
}
