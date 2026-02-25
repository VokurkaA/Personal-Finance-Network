import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/recommendations")({
  component: RecommendationsPage,
})

function RecommendationsPage() {
  return (
    <></>
  )
}
