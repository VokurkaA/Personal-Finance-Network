import { useNavigate, useRouterState } from '@tanstack/react-router'
import { startTransition, memo } from 'react'
import { Button, ScrollShadow, Modal, ListBox } from '@heroui/react'
import { Sun, Moon, TrendingUp } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { NAV_ITEMS } from '../config/nav'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const NavLinks = memo(function NavLinks({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Find active item
  const activeKey =
    NAV_ITEMS.find(({ to }) => (to === '/' ? pathname === '/' : pathname.startsWith(to)))?.to ?? '/'

  return (
    <ScrollShadow className="flex-1">
      <div className="px-2 py-4">
        <ListBox
          aria-label="Main navigation"
          selectionMode="none"
          onAction={(key) => {
            startTransition(() => {
              navigate({ to: key as string })
              onClose?.()
            })
          }}
          className="gap-1"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <ListBox.Item
              key={to}
              id={to}
              textValue={label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors data-[hovered=true]:bg-default-100 ${
                to === activeKey ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground-500'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </ListBox.Item>
          ))}
        </ListBox>
      </div>
    </ScrollShadow>
  )
})

const SidebarContent = memo(function SidebarContent({ onClose }: { onClose?: () => void }) {
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
})

export const Sidebar = memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop — always visible */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile — overlay drawer using HeroUI Modal */}
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()} variant="blur">
        <Modal.Container placement="top" size="full" className="justify-start">
          <Modal.Dialog className="h-full w-60 max-w-[80vw] rounded-none shadow-2xl animate-in slide-in-from-left duration-300">
            <Modal.CloseTrigger className="absolute top-2 right-2 z-10" />
            <SidebarContent onClose={onClose} />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
})
