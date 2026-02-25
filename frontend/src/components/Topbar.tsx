import { useRouterState } from "@tanstack/react-router"
import { Button } from "@heroui/react"
import { Menu } from "lucide-react"
import { NAV_ITEMS } from "../config/nav"

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
    </header>
  )
}
