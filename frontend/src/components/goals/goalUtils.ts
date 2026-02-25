export function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export const GOAL_TYPE_COLOR = {
  savings: 'success',
  investment: 'accent',
  debt_payoff: 'warning',
} as const

export const RISK_COLOR = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
} as const
