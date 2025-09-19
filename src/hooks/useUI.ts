import { useCallback } from 'react'
import { useUIStore } from '../stores/ui'
import type { Notification } from '../types/store'

// Custom hook for UI state management
export const useUI = () => {
  const {
    sidebarOpen,
    theme,
    notifications,
    toggleSidebar,
    setTheme,
    addNotification,
    removeNotification
  } = useUIStore()

  // Show success notification
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }, [addNotification])

  // Show error notification
  const showError = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 8000 // Longer duration for errors
    })
  }, [addNotification])

  // Show warning notification
  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }, [addNotification])

  // Show info notification
  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }, [addNotification])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    notifications.forEach(notification => {
      removeNotification(notification.id)
    })
  }, [notifications, removeNotification])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  // Check if dark mode is active
  const isDarkMode = theme === 'dark'

  // Get notification count by type
  const getNotificationCount = useCallback((type?: Notification['type']): number => {
    if (!type) return notifications.length
    return notifications.filter(n => n.type === type).length
  }, [notifications])

  // Check if there are any error notifications
  const hasErrors = getNotificationCount('error') > 0

  // Check if there are any warning notifications
  const hasWarnings = getNotificationCount('warning') > 0

  return {
    // State
    sidebarOpen,
    theme,
    notifications,
    isDarkMode,
    hasErrors,
    hasWarnings,
    
    // Actions
    toggleSidebar,
    setTheme,
    toggleTheme,
    
    // Notification actions
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllNotifications,
    getNotificationCount
  }
}