import { Accordion, Chip } from '@heroui/react'
import { ChevronDown } from 'lucide-react'

interface AccordionSectionProps {
  id: string
  icon: React.ReactNode
  title: string
  count: number
  isLoading: boolean
  children: React.ReactNode
}

export function AccordionSection({
  id,
  icon,
  title,
  count,
  isLoading,
  children,
}: AccordionSectionProps) {
  return (
    <Accordion.Item id={id}>
      <Accordion.Heading>
        <Accordion.Trigger className="flex w-full items-center justify-between py-3 px-4 text-left font-medium hover:bg-content2 transition-colors rounded-lg">
          <span className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold">{title}</span>
            {!isLoading && (
              <Chip size="sm" variant="soft" color="default">
                {count}
              </Chip>
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-foreground-400 transition-transform data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body className="px-2 pb-4">{children}</Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  )
}
