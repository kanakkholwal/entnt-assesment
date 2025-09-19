import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"
import { Skeleton } from "./skeleton"
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "./button"

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
  className?: string
}

export function LoadingOverlay({ isLoading, children, text, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function LoadingButton({ isLoading, children, className, disabled, ...props }: LoadingButtonProps & React.ComponentProps<"button">) {
  return (
    <button
      className={cn("inline-flex items-center gap-2", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8", className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  )
}

// Skeleton components for different content types
export function JobCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  )
}

export function CandidateCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function AssessmentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
  error?: string | Error | null
  isEmpty?: boolean
  isOffline?: boolean
  emptyState?: {
    title: string
    description?: string
    action?: React.ReactNode
    icon?: React.ReactNode
  }
  loadingComponent?: React.ReactNode
  skeletonComponent?: React.ReactNode
  children: React.ReactNode
  onRetry?: () => void
  retryCount?: number
  maxRetries?: number
}

export function LoadingState({
  isLoading,
  error,
  isEmpty,
  isOffline,
  emptyState,
  loadingComponent,
  skeletonComponent,
  children,
  onRetry,
  retryCount = 0,
  maxRetries = 3
}: LoadingStateProps) {
  if (isLoading) {
    return skeletonComponent || loadingComponent || <LoadingSpinner text="Loading..." />
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || isOffline
    
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="mb-4">
          {isNetworkError ? (
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-destructive" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
        </h3>
        
        <p className="text-muted-foreground mb-4 max-w-md">
          {isNetworkError 
            ? 'Please check your internet connection and try again.'
            : errorMessage
          }
        </p>
        
        {onRetry && (
          <div className="flex flex-col items-center gap-2">
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Attempt {retryCount} of {maxRetries}
              </p>
            )}
          </div>
        )}
        
        {isNetworkError && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4" />
              <span className="font-medium">Troubleshooting tips:</span>
            </div>
            <ul className="text-left space-y-1 text-muted-foreground">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Disable any VPN or proxy</li>
              <li>• Clear your browser cache</li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (isEmpty && emptyState) {
    return <EmptyState {...emptyState} />
  }

  return <>{children}</>
}