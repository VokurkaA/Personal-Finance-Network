export function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export const PRIORITY_COLOR = {
  high: 'danger',
  medium: 'warning',
  low: 'default',
} as const

export const RISK_COLOR = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
} as const
