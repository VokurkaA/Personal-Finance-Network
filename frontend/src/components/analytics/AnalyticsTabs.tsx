import { Link, useRouterState } from '@tanstack/react-router'

const TABS = [
  { to: '/analytics', label: 'Money Flow', exact: true },
  { to: '/analytics/spending', label: 'Spending Analysis', exact: false },
] as const

export function AnalyticsTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="flex border-b border-divider">
      {TABS.map(({ to, label, exact }) => {
        const isActive = exact ? pathname === to : pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-400 hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
