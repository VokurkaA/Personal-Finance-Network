import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart2,
  Wallet,
  Target,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
] as const
