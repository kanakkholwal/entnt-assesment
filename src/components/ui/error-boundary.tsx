import React from "react"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Button } from "./button"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"


interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void; errorInfo?: React.ErrorInfo }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
  showDetails?: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { level = 'component', onError } = this.props
    
    // Enhanced error logging
    console.group(`🚨 ErrorBoundary (${level})`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // Store error info for detailed display
    this.setState({ errorInfo })

    // Report error to external service (if configured)
    this.reportError(error, errorInfo)
    
    // Call custom error handler
    onError?.(error, errorInfo)
  }

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, this would send to an error reporting service
    // For now, we'll just log it with additional context
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    }
    
    console.warn('Error Report:', errorReport)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error} 
            resetError={this.resetError}
            errorInfo={this.state.errorInfo}
          />
        )
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
          level={this.props.level}
          showDetails={this.props.showDetails}
          errorId={this.state.errorId}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
  level?: 'page' | 'component' | 'critical'
  showDetails?: boolean
  errorId?: string
}

function DefaultErrorFallback({ 
  error, 
  resetError, 
  errorInfo, 
  level = 'component',
  showDetails = false,
  errorId 
}: ErrorFallbackProps) {
  const [showDetailedError, setShowDetailedError] = React.useState(showDetails)
  
  const getErrorTitle = () => {
    switch (level) {
      case 'critical':
        return 'Critical Error'
      case 'page':
        return 'Page Error'
      default:
        return 'Something went wrong'
    }
  }

  const getErrorDescription = () => {
    if (level === 'critical') {
      return 'A critical error has occurred. Please refresh the page or contact support if the problem persists.'
    }
    if (level === 'page') {
      return 'This page encountered an error. You can try refreshing or go back to the home page.'
    }
    return error?.message || 'An unexpected error occurred. Please try again.'
  }

  const getErrorIcon = () => {
    switch (level) {
      case 'critical':
        return <Bug className="h-4 w-4" />
      case 'page':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleReportError = () => {
    // In a real app, this would open a support ticket or send feedback
    const errorDetails = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      errorId,
      timestamp: new Date().toISOString()
    }
    
    console.log('Reporting error:', errorDetails)
    // For now, just copy to clipboard
    navigator.clipboard?.writeText(JSON.stringify(errorDetails, null, 2))
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Alert className={`max-w-md ${level === 'critical' ? 'border-destructive' : ''}`}>
        {getErrorIcon()}
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          {getErrorDescription()}
          {errorId && (
            <div className="text-xs text-muted-foreground mt-2">
              Error ID: {errorId}
            </div>
          )}
        </AlertDescription>
        
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex gap-2">
            <Button
              onClick={resetError}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            
            {level === 'page' && (
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Button>
            )}
          </div>
          
          {error && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDetailedError(!showDetailedError)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {showDetailedError ? 'Hide' : 'Show'} details
              </Button>
              
              <Button
                onClick={handleReportError}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Report error
              </Button>
            </div>
          )}
        </div>
        
        {showDetailedError && error && (
          <div className="mt-4 p-2 bg-muted rounded text-xs font-mono overflow-auto max-h-32">
            <div className="font-semibold mb-1">Error:</div>
            <div className="text-destructive mb-2">{error.message}</div>
            {error.stack && (
              <>
                <div className="font-semibold mb-1">Stack:</div>
                <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
              </>
            )}
          </div>
        )}
      </Alert>
    </div>
  )
}

// Hook for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}