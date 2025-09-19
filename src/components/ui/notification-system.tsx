import React from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { useUI } from '../../hooks/useUI'
import { useNetworkStatus } from '../../hooks/useErrorHandler'

interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss: (id: string) => void
}

function NotificationItem({ 
  id, 
  type, 
  title, 
  message, 
  action, 
  onDismiss 
}: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500'
      case 'error':
        return 'border-l-red-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'info':
        return 'border-l-blue-500'
    }
  }

  return (
    <div className={cn(
      "relative flex items-start gap-3 p-4 bg-background border border-l-4 rounded-lg shadow-lg",
      getBorderColor(),
      "animate-in slide-in-from-right-full duration-300"
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">
          {title}
        </h4>
        {message && (
          <p className="mt-1 text-sm text-muted-foreground">
            {message}
          </p>
        )}
        {action && (
          <div className="mt-3">
            <Button
              onClick={action.onClick}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
      
      <Button
        onClick={() => onDismiss(id)}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

function NetworkStatusIndicator() {
  const { isOnline } = useNetworkStatus()
  
  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg">
        <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          You're offline
        </span>
      </div>
    </div>
  )
}

export function NotificationSystem() {
  const { notifications, removeNotification } = useUI()

  return (
    <>
      {/* Notification Stack */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            duration={notification.duration}
            onDismiss={removeNotification}
          />
        ))}
      </div>

      {/* Network Status Indicator */}
      <NetworkStatusIndicator />
    </>
  )
}

// Global error boundary for the entire app
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      level="critical"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log critical errors
        console.error('Critical error caught by global boundary:', error, errorInfo)
        
        // In production, this would send to error reporting service
        if (process.env.NODE_ENV === 'production') {
          // Example: Sentry.captureException(error, { extra: errorInfo })
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Import ErrorBoundary from the existing component
import { ErrorBoundary } from './error-boundary'