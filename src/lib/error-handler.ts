import { toast } from 'sonner'
import { APIError } from '../services/api'

export interface AppError {
  code: string
  message: string
  details?: any
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class ErrorHandler {
  private static retryAttempts = new Map<string, number>()
  private static maxRetries = 3

  /**
   * Transform various error types into standardized AppError
   */
  static normalizeError(error: unknown): AppError {
    if (error instanceof APIError) {
      return {
        code: error.code || 'API_ERROR',
        message: error.message,
        details: { status: error.status },
        retryable: error.retryable,
        severity: error.status >= 500 ? 'high' : 'medium'
      }
    }

    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed. Please check your internet connection.',
          retryable: true,
          severity: 'medium'
        }
      }

      // Timeout errors
      if (error.message.includes('timeout')) {
        return {
          code: 'TIMEOUT_ERROR',
          message: 'Request timed out. Please try again.',
          retryable: true,
          severity: 'medium'
        }
      }

      // Generic JavaScript errors
      return {
        code: 'JAVASCRIPT_ERROR',
        message: error.message,
        details: { stack: error.stack },
        retryable: false,
        severity: 'high'
      }
    }

    // Unknown error type
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: error,
      retryable: false,
      severity: 'medium'
    }
  }

  /**
   * Handle errors with automatic retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    options: {
      maxRetries?: number
      baseDelay?: number
      onError?: (error: AppError, attempt: number) => void
      showToast?: boolean
    } = {}
  ): Promise<T> {
    const {
      maxRetries = this.maxRetries,
      baseDelay = 1000,
      onError,
      showToast = true
    } = options

    let lastError: AppError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        
        // Reset retry count on success
        this.retryAttempts.delete(operationId)
        
        return result
      } catch (error) {
        lastError = this.normalizeError(error)
        
        // Track retry attempts
        this.retryAttempts.set(operationId, attempt)
        
        // Call error callback
        onError?.(lastError, attempt)

        // Don't retry non-retryable errors or client errors
        if (!lastError.retryable || attempt === maxRetries) {
          if (showToast) {
            this.showErrorToast(lastError, attempt, maxRetries)
          }
          throw lastError
        }

        // Show retry toast
        if (showToast && attempt < maxRetries) {
          toast.warning(`Attempt ${attempt} failed, retrying...`, {
            duration: 2000
          })
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * Show appropriate error toast based on error type
   */
  static showErrorToast(error: AppError, attempt?: number, maxRetries?: number) {
    const isRetryExhausted = attempt && maxRetries && attempt >= maxRetries

    let title = 'Error'
    let description = error.message

    switch (error.severity) {
      case 'critical':
        title = 'Critical Error'
        break
      case 'high':
        title = 'Error'
        break
      case 'medium':
        title = 'Something went wrong'
        break
      case 'low':
        title = 'Warning'
        break
    }

    if (isRetryExhausted && error.retryable) {
      description += ` (Failed after ${maxRetries} attempts)`
    }

    toast.error(title, {
      description,
      duration: error.severity === 'critical' ? 10000 : 6000,
      action: error.retryable && !isRetryExhausted ? {
        label: 'Retry',
        onClick: () => {
          // This would need to be handled by the calling component
          console.log('Retry requested for:', error.code)
        }
      } : undefined
    })
  }

  /**
   * Show success toast with optional action
   */
  static showSuccess(message: string, options?: {
    description?: string
    duration?: number
    action?: { label: string; onClick: () => void }
  }) {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
    })
  }

  /**
   * Show warning toast
   */
  static showWarning(message: string, description?: string) {
    toast.warning(message, {
      description,
      duration: 5000
    })
  }

  /**
   * Show info toast
   */
  static showInfo(message: string, description?: string) {
    toast.info(message, {
      description,
      duration: 4000
    })
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AppError): string {
    const errorMessages: Record<string, string> = {
      NETWORK_ERROR: 'Please check your internet connection and try again.',
      TIMEOUT_ERROR: 'The request took too long. Please try again.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
      NOT_FOUND_ERROR: 'The requested resource was not found.',
      SERVER_ERROR: 'Server error occurred. Please try again later.',
      RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.'
    }

    return errorMessages[error.code] || error.message
  }

  /**
   * Get recovery suggestions based on error type
   */
  static getRecoverySuggestions(error: AppError): string[] {
    const suggestions: Record<string, string[]> = {
      NETWORK_ERROR: [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN or proxy if enabled'
      ],
      TIMEOUT_ERROR: [
        'Try again in a few moments',
        'Check your internet speed',
        'Close other browser tabs'
      ],
      VALIDATION_ERROR: [
        'Review the form fields',
        'Check required fields',
        'Ensure data format is correct'
      ],
      PERMISSION_ERROR: [
        'Contact your administrator',
        'Check if you\'re logged in',
        'Verify your account permissions'
      ],
      SERVER_ERROR: [
        'Try again in a few minutes',
        'Contact support if problem persists',
        'Check system status page'
      ]
    }

    return suggestions[error.code] || ['Try again later', 'Contact support if problem persists']
  }

  /**
   * Log error for debugging and monitoring
   */
  static logError(error: AppError, context?: Record<string, any>) {
    const errorLog = {
      ...error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') // If available
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error: ${error.code}`)
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Context:', context)
      console.groupEnd()
    }

    // In production, send to error reporting service
    // This would integrate with services like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorLog })
      console.warn('Error logged:', errorLog)
    }
  }

  /**
   * Check if error should be retried
   */
  static shouldRetry(error: AppError, attempt: number, maxRetries: number): boolean {
    if (!error.retryable || attempt >= maxRetries) {
      return false
    }

    // Don't retry client errors (4xx)
    if (error.code === 'API_ERROR' && error.details?.status >= 400 && error.details?.status < 500) {
      return false
    }

    return true
  }

  /**
   * Get retry delay with exponential backoff
   */
  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 1000
    const maxDelay = 30000 // 30 seconds max
    
    return Math.min(exponentialDelay + jitter, maxDelay)
  }

  /**
   * Clear retry attempts for an operation
   */
  static clearRetryAttempts(operationId: string) {
    this.retryAttempts.delete(operationId)
  }

  /**
   * Get current retry attempt for an operation
   */
  static getRetryAttempt(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0
  }
}

// Export convenience functions
export const {
  normalizeError,
  withRetry,
  showErrorToast,
  showSuccess,
  showWarning,
  showInfo,
  getUserFriendlyMessage,
  getRecoverySuggestions,
  logError
} = ErrorHandler