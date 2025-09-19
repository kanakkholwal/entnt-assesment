import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UIStore, Notification } from '../types/store'

// Initial state
const initialState = {
  sidebarOpen: true,
  theme: 'light' as const,
  notifications: []
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Toggle sidebar
        toggleSidebar: () => {
          set(state => ({ sidebarOpen: !state.sidebarOpen }))
        },

        // Set theme
        setTheme: (theme: 'light' | 'dark') => {
          set({ theme })
          
          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark')
          }
        },

        // Add notification
        addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newNotification: Notification = {
            ...notification,
            id,
            createdAt: new Date(),
            duration: notification.duration || 5000
          }
          
          set(state => ({
            notifications: [...state.notifications, newNotification]
          }))
          
          // Auto-remove notification after duration
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, newNotification.duration)
          }
        },

        // Remove notification
        removeNotification: (id: string) => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }))
        }
      }),
      {
        name: 'ui-store',
        partialize: (state: UIStore) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme
        })
      }
    ),
    {
      name: 'ui-store'
    }
  )
)