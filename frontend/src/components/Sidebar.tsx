import { Link } from '@tanstack/react-router'
import { Button, ScrollShadow } from '@heroui/react'
import { Sun, Moon, TrendingUp, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { NAV_ITEMS } from '../config/nav'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function NavLinks({ onClose }: { onClose?: () => void }) {
  return (
    <ScrollShadow className="flex-1">
      <nav className="px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === '/' }}
            activeProps={{ className: 'bg-primary/10 text-primary font-semibold' }}
            inactiveProps={{
              className: 'text-foreground-500 hover:bg-default-100 hover:text-foreground',
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
            onClick={onClose}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </ScrollShadow>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex h-full flex-col bg-content1 border-r border-divider">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 shrink-0">
        <TrendingUp className="h-5 w-5 text-primary" />
        <span className="font-semibold text-base tracking-tight">Finance</span>
      </div>
      <hr className="border-divider" />

      {/* Nav links */}
      <NavLinks onClose={onClose} />

      <hr className="border-divider" />
      {/* Theme toggle */}
      <div className="px-3 py-3 shrink-0">
        <Button
          variant="ghost"
          onPress={toggle}
          className="w-full justify-start gap-3 text-foreground-500"
          size="sm"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 shrink-0" />
          ) : (
            <Sun className="h-4 w-4 shrink-0" />
          )}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop — always visible */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile — overlay drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

        {/* Drawer panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-60 flex flex-col transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onClose}
            aria-label="Close menu"
            className="absolute top-2 right-2 z-10 text-foreground-400"
          >
            <X className="h-4 w-4" />
          </Button>

          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    </>
  )
}
