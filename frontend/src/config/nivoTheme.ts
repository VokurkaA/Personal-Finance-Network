import type { PartialTheme } from '@nivo/theming'
import { useCSSVariable } from '@heroui/react'
import { useMemo } from 'react'

/**
 * Resolves any CSS color string (var, oklch, etc.) to a standard rgb() string
 * that Nivo's animation engine can parse.
 */
function resolveToRgb(color: string | undefined): string {
  if (!color) return '#000000'
  if (typeof window === 'undefined') return color

  // Create a temporary element to let the browser resolve the color
  const div = document.createElement('div')
  div.style.color = color
  document.body.appendChild(div)
  const resolved = getComputedStyle(div).color
  document.body.removeChild(div)

  return resolved
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
  // Resolve base theme colors using HeroUI's hook
  // We disable cache to ensure it updates when the theme (data-theme) changes
  const fg = resolveToRgb(useCSSVariable('--foreground', undefined, false))
  const muted = resolveToRgb(useCSSVariable('--muted', undefined, false))
  const border = resolveToRgb(useCSSVariable('--border', undefined, false))
  const separator = resolveToRgb(useCSSVariable('--separator', undefined, false))
  const overlay = resolveToRgb(useCSSVariable('--overlay', undefined, false))
  const overlayFg = resolveToRgb(useCSSVariable('--overlay-foreground', undefined, false))

  // Resolve the palette
  const success = useCSSVariable('--success', undefined, false)
  const danger = useCSSVariable('--danger', undefined, false)

  const colors = useMemo(() => {
    return CHART_COLOR_VARIABLES.map((v) => resolveToRgb(`var(${v})`))
  }, []) // Core variables are CSS strings, the actual values change in the DOM. Empty deps is fine since resolveToRgb handles fresh resolution.

  const theme: PartialTheme = useMemo(
    () => ({
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
    }),
    [fg, muted, border, separator, overlay, overlayFg],
  )

  return { theme, colors, success: resolveToRgb(success), danger: resolveToRgb(danger) }
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
