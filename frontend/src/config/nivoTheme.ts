import type { PartialTheme } from '@nivo/theming'

export const CHART_COLORS = [
  '#6366f1', // indigo
  '#22d3ee', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#a78bfa', // violet
  '#34d399', // green
  '#fb923c', // orange
]

export function getNivoTheme(isDark: boolean): PartialTheme {
  const textColor = isDark ? '#a1a1aa' : '#52525b'
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tooltipBg = isDark ? '#18181b' : '#ffffff'
  const tooltipText = isDark ? '#fafafa' : '#09090b'

  return {
    background: 'transparent',
    text: {
      fontSize: 12,
      fill: textColor,
    },
    axis: {
      domain: {
        line: {
          stroke: gridColor,
          strokeWidth: 1,
        },
      },
      legend: {
        text: {
          fontSize: 12,
          fill: textColor,
        },
      },
      ticks: {
        line: {
          stroke: gridColor,
          strokeWidth: 1,
        },
        text: {
          fontSize: 11,
          fill: textColor,
        },
      },
    },
    grid: {
      line: {
        stroke: gridColor,
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fontSize: 12,
        fill: textColor,
      },
    },
    tooltip: {
      container: {
        background: tooltipBg,
        color: tooltipText,
        fontSize: 12,
        borderRadius: 8,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
        padding: '8px 12px',
      },
    },
    labels: {
      text: {
        fontSize: 11,
        fill: textColor,
      },
    },
  }
}
