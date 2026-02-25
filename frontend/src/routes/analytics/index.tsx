import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/analytics/")({
  component: AnalyticsIndexPage,
})

function AnalyticsIndexPage() {
  return (
    <></>
  )
}
