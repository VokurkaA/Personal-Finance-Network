import { useRouterState } from '@tanstack/react-router'
import { Button, Select, ListBox, type Key } from '@heroui/react'
import { Menu } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { startTransition, memo } from 'react'
import { NAV_ITEMS } from '../config/nav'
import { useAccounts } from '../queries/useAccounts'
import { selectedAccountStore, selectAccount } from '../store/selectedAccountStore'

interface TopbarProps {
  onMenuClick: () => void
}

function usePageTitle(): string {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const match = NAV_ITEMS.find(({ to }) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to),
  )
  return match?.label ?? 'Finance'
}

export const Topbar = memo(function Topbar({ onMenuClick }: TopbarProps) {
  const title = usePageTitle()
  const { data: accounts = [] } = useAccounts()
  const accountId = useStore(selectedAccountStore, (s) => s.accountId)
  const isNavigating = useRouterState({ select: (s) => s.status === 'pending' })

  const handleAccountChange = (key: Key | null) => {
    startTransition(() => {
      selectAccount(key === 'all' ? null : (key as string))
    })
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-divider bg-background/80 backdrop-blur-md px-4 shrink-0">
      {/* Navigation loading bar */}
      {isNavigating && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="h-full bg-primary animate-[navprogress_1s_ease-in-out_infinite]" />
        </div>
      )}
      {/* Hamburger — mobile only */}
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        onPress={onMenuClick}
        aria-label="Open menu"
        className="md:hidden text-foreground-400"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Account selector — desktop only */}
      {accounts.length > 0 && (
        <div className="hidden md:block">
          <Select
            aria-label="Select account"
            value={accountId ?? 'all'}
            onChange={handleAccountChange}
            className="w-44"
            variant="secondary"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All accounts">
                  All accounts
                </ListBox.Item>
                {accounts.map((acc) => (
                  <ListBox.Item key={acc.id} id={acc.id} textValue={acc.name}>
                    {acc.name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      )}
    </header>
  )
})
