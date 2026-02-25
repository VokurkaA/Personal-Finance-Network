import { Store } from '@tanstack/store'

export interface UiState {
  sidebarOpen: boolean
}

export const uiStore = new Store<UiState>({
  sidebarOpen: false,
})

export function openSidebar(): void {
  uiStore.setState(() => ({ sidebarOpen: true }))
}

export function closeSidebar(): void {
  uiStore.setState(() => ({ sidebarOpen: false }))
}

export function toggleSidebar(): void {
  uiStore.setState((prev) => ({ sidebarOpen: !prev.sidebarOpen }))
}
