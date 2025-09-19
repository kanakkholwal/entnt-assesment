import { LoadingSpinner } from "./loading-spinner"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface AsyncWrapperProps {
  loading?: boolean
  error?: string | Error | null
  onRetry?: () => void
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
}

export function AsyncWrapper({
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent
}: AsyncWrapperProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        {loadingComponent || <LoadingSpinner size="lg" />}
      </div>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorComponent) {
      return <>{errorComponent}</>
    }

    return (
      <div className="flex items-center justify-center p-8">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-2">
            {errorMessage}
          </AlertDescription>
          {onRetry && (
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
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}