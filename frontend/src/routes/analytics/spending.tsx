import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/analytics/spending")({
  component: SpendingAnalyticsPage,
})

function SpendingAnalyticsPage() {
  return (
    <></>
  )
}
