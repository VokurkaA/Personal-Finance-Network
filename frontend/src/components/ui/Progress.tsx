interface ProgressProps {
  value: number // 0–100
  color?: "success" | "danger" | "warning" | "primary" | "default"
  size?: "sm" | "md" | "lg"
  label?: string
  showValueLabel?: boolean
  className?: string
  "aria-label"?: string
}

const COLOR_MAP: Record<NonNullable<ProgressProps["color"]>, string> = {
  success: "bg-green-500",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  primary: "bg-indigo-500",
  default: "bg-zinc-500",
}

const TRACK_MAP: Record<NonNullable<ProgressProps["color"]>, string> = {
  success: "bg-green-500/20",
  danger: "bg-red-500/20",
  warning: "bg-amber-500/20",
  primary: "bg-indigo-500/20",
  default: "bg-zinc-500/20",
}

const HEIGHT_MAP: Record<NonNullable<ProgressProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

export function Progress({
  value,
  color = "primary",
  size = "md",
  label,
  showValueLabel = false,
  className = "",
}: ProgressProps) {
  const pct = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      {(label || showValueLabel) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-zinc-500 truncate">{label}</span>}
          {showValueLabel && (
            <span className="text-xs font-semibold ml-auto">{pct.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full ${HEIGHT_MAP[size]} ${TRACK_MAP[color]}`}>
        <div
          className={`${HEIGHT_MAP[size]} rounded-full transition-all duration-300 ${COLOR_MAP[color]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
