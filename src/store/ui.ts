import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme } from '@/types'

interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  notifications: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setNotifications: (enabled: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      notifications: true,

      setTheme: (theme: Theme) => {
        set({ theme })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      setNotifications: (enabled: boolean) => {
        set({ notifications: enabled })
      },
    }),
    {
      name: 'ui-storage',
    }
  )
)
