import { LoadingSpinner } from "./loading-spinner"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"
import { AlertTriangle, RefreshCw, WifiOff, Clock } from "lucide-react"
import { ErrorHandler, type AppError } from "../../lib/error-handler"
import { useNetworkStatus } from "../../hooks/useErrorHandler"

interface AsyncWrapperProps {
  loading?: boolean
  error?: string | Error | AppError | null
  onRetry?: () => void
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  retryCount?: number
  maxRetries?: number
  showRecoverySuggestions?: boolean
}

export function AsyncWrapper({
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  retryCount = 0,
  maxRetries = 3,
  showRecoverySuggestions = true
}: AsyncWrapperProps) {
  const { isOnline } = useNetworkStatus()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        {loadingComponent || <LoadingSpinner size="lg" />}
      </div>
    )
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>
    }

    // Normalize error
    const normalizedError = error instanceof Error || typeof error === 'object' && error !== null && 'code' in error
      ? ErrorHandler.normalizeError(error)
      : ErrorHandler.normalizeError(new Error(String(error)))

    const isNetworkError = normalizedError.code === 'NETWORK_ERROR' || !isOnline
    const isRetryExhausted = retryCount >= maxRetries
    const canRetry = normalizedError.retryable && !isRetryExhausted && onRetry

    const getErrorIcon = () => {
      if (isNetworkError) return <WifiOff className="h-4 w-4" />
      if (normalizedError.code === 'TIMEOUT_ERROR') return <Clock className="h-4 w-4" />
      return <AlertTriangle className="h-4 w-4" />
    }

    const getErrorTitle = () => {
      if (isNetworkError) return 'Connection Problem'
      if (normalizedError.code === 'TIMEOUT_ERROR') return 'Request Timeout'
      return 'Error'
    }

    const getErrorMessage = () => {
      if (isNetworkError && !isOnline) {
        return 'You appear to be offline. Please check your internet connection.'
      }
      return ErrorHandler.getUserFriendlyMessage(normalizedError)
    }

    return (
      <div className="flex items-center justify-center p-8">
        <Alert className="max-w-md">
          {getErrorIcon()}
          <AlertTitle>{getErrorTitle()}</AlertTitle>
          <AlertDescription className="mt-2">
            {getErrorMessage()}
            
            {retryCount > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Attempt {retryCount} of {maxRetries}
              </div>
            )}
          </AlertDescription>
          
          {canRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          )}

          {showRecoverySuggestions && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Troubleshooting:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {ErrorHandler.getRecoverySuggestions(normalizedError).map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}