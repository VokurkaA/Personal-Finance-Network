import { useRouterState } from "@tanstack/react-router"
import { Button } from "@heroui/react"
import { Menu } from "lucide-react"
import { useStore } from "@tanstack/react-store"
import { NAV_ITEMS } from "../config/nav"
import { useAccounts } from "../queries/useAccounts"
import { selectedAccountStore, selectAccount } from "../store/selectedAccountStore"

interface TopbarProps {
  onMenuClick: () => void
}

function usePageTitle(): string {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const match = NAV_ITEMS.find(({ to }) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to)
  )
  return match?.label ?? "Finance"
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const title = usePageTitle()
  const { data: accounts = [] } = useAccounts()
  const accountId = useStore(selectedAccountStore, (s) => s.accountId)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-divider bg-background/80 backdrop-blur-md px-4 shrink-0">
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
          <select
            className="border border-divider rounded-lg bg-background text-foreground text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none w-44"
            aria-label="Select account"
            value={accountId ?? ""}
            onChange={(e) => selectAccount(e.target.value || null)}
          >
            <option value="">All accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  )
}
