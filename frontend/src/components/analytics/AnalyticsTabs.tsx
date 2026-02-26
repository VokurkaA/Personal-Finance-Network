import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Tabs } from '@heroui/react'

const TABS = [
  { id: '/analytics', label: 'Money Flow' },
  { id: '/analytics/spending', label: 'Spending Analysis' },
] as const

export function AnalyticsTabs() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Find the closest matching tab ID
  const activeTab =
    TABS.find((t) => pathname === t.id || (t.id !== '/analytics' && pathname.startsWith(t.id)))
      ?.id ?? '/analytics'

  return (
    <div className="w-full border-b border-divider pb-0">
      <Tabs
        variant="primary"
        selectedKey={activeTab}
        onSelectionChange={(key) => navigate({ to: key as string })}
        className="w-full"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Analytics sections">
            {TABS.map(({ id, label }) => (
              <Tabs.Tab key={id} id={id}>
                {label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  )
}
