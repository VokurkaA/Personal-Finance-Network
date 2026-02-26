import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useStore } from '@tanstack/react-store'
import { Toast } from '@heroui/react'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { uiStore, openSidebar, closeSidebar } from '../store/uiStore'
import { accountsQueryOptions } from '../queries/useAccounts'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(accountsQueryOptions),
  component: RootComponent,
})

function AppShell() {
  const sidebarOpen = useStore(uiStore, (s) => s.sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      <Toast.Provider />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuClick={openSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}
