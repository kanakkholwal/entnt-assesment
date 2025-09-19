import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"

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

interface LoadingStateProps {
  isLoading: boolean
  error?: string | null
  isEmpty?: boolean
  emptyState?: {
    title: string
    description?: string
    action?: React.ReactNode
    icon?: React.ReactNode
  }
  loadingComponent?: React.ReactNode
  children: React.ReactNode
  onRetry?: () => void
}

export function LoadingState({
  isLoading,
  error,
  isEmpty,
  emptyState,
  loadingComponent,
  children,
  onRetry
}: LoadingStateProps) {
  if (isLoading) {
    return loadingComponent || <LoadingSpinner text="Loading..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="text-destructive mb-2">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (isEmpty && emptyState) {
    return <EmptyState {...emptyState} />
  }

  return <>{children}</>
}