import type { PartialTheme } from '@nivo/theming'
import { useCSSVariable } from '@heroui/react'
import { useMemo } from 'react'

/**
 * Resolves any CSS color string (var, oklch, etc.) to a standard rgb() string
 * that Nivo's animation engine can parse.
 * Optimizes by reusing a single element.
 */
let colorResolverElement: HTMLDivElement | null = null

function resolveToRgb(color: string | undefined): string {
  if (!color) return '#000000'
  if (typeof window === 'undefined') return color

  if (!colorResolverElement) {
    colorResolverElement = document.createElement('div')
    colorResolverElement.style.display = 'none'
    colorResolverElement.style.visibility = 'hidden'
    colorResolverElement.style.pointerEvents = 'none'
    colorResolverElement.id = 'nivo-color-resolver'
    document.body.appendChild(colorResolverElement)
  }

  colorResolverElement.style.color = color
  return getComputedStyle(colorResolverElement).color
}

export const CHART_COLOR_VARIABLES = [
  '--accent',
  '--success',
  '--danger',
  '--warning',
  '--primary',
  '--secondary',
  '--surface-tertiary',
  '--muted',
]

export function useResolvedChartTheme() {
  const rawFg = useCSSVariable('--foreground')
  const rawMuted = useCSSVariable('--muted')
  const rawBorder = useCSSVariable('--border')
  const rawSeparator = useCSSVariable('--separator')
  const rawOverlay = useCSSVariable('--overlay')
  const rawOverlayFg = useCSSVariable('--overlay-foreground')
  const rawSuccess = useCSSVariable('--success')
  const rawDanger = useCSSVariable('--danger')

  return useMemo(() => {
    const fg = resolveToRgb(rawFg)
    const muted = resolveToRgb(rawMuted)
    const border = resolveToRgb(rawBorder)
    const separator = resolveToRgb(rawSeparator)
    const overlay = resolveToRgb(rawOverlay)
    const overlayFg = resolveToRgb(rawOverlayFg)
    const success = resolveToRgb(rawSuccess)
    const danger = resolveToRgb(rawDanger)

    const colors = CHART_COLOR_VARIABLES.map((v) => resolveToRgb(`var(${v})`))

    const theme: PartialTheme = {
      background: 'transparent',
      text: { fontSize: 12, fill: muted },
      axis: {
        domain: { line: { stroke: separator, strokeWidth: 1 } },
        legend: { text: { fontSize: 12, fill: fg } },
        ticks: {
          line: { stroke: separator, strokeWidth: 1 },
          text: { fontSize: 11, fill: muted },
        },
      },
      grid: { line: { stroke: separator, strokeWidth: 1 } },
      legends: { text: { fontSize: 12, fill: fg } },
      tooltip: {
        container: {
          background: overlay,
          color: overlayFg,
          fontSize: 12,
          borderRadius: 8,
          boxShadow: 'var(--overlay-shadow)',
          padding: '8px 12px',
          border: `1px solid ${border}`,
        },
      },
      labels: { text: { fontSize: 11, fill: fg } },
    }

    return { theme, colors, success, danger }
  }, [rawFg, rawMuted, rawBorder, rawSeparator, rawOverlay, rawOverlayFg, rawSuccess, rawDanger])
}

// Legacy export for non-hook usage if needed (reverts to safe hex)
export function getNivoTheme(isDark: boolean): PartialTheme {
  const textColor = isDark ? '#a1a1aa' : '#52525b'
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tooltipBg = isDark ? '#18181b' : '#ffffff'
  const tooltipText = isDark ? '#fafafa' : '#09090b'
  const borderColor = isDark ? '#3f3f46' : '#e4e4e7'

  return {
    background: 'transparent',
    text: { fontSize: 12, fill: textColor },
    axis: {
      domain: { line: { stroke: gridColor, strokeWidth: 1 } },
      legend: { text: { fontSize: 12, fill: textColor } },
      ticks: {
        line: { stroke: gridColor, strokeWidth: 1 },
        text: { fontSize: 11, fill: textColor },
      },
    },
    grid: { line: { stroke: gridColor, strokeWidth: 1 } },
    legends: { text: { fontSize: 12, fill: textColor } },
    tooltip: {
      container: {
        background: tooltipBg,
        color: tooltipText,
        fontSize: 12,
        borderRadius: 8,
        boxShadow: isDark
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '8px 12px',
        border: `1px solid ${borderColor}`,
      },
    },
    labels: { text: { fontSize: 11, fill: textColor } },
  }
}
