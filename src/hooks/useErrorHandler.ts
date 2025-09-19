import React, { useCallback, useState } from 'react'
import { ErrorHandler, type AppError } from '../lib/error-handler'
import { useUI } from './useUI'

interface UseErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  onError?: (error: AppError) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast = true, logError = true, onError } = options
  const { showError } = useUI()
  const [lastError, setLastError] = useState<AppError | null>(null)

  const handleError = useCallback((error: unknown, context?: Record<string, any>) => {
    const normalizedError = ErrorHandler.normalizeError(error)
    
    setLastError(normalizedError)

    // Log error if enabled
    if (logError) {
      ErrorHandler.logError(normalizedError, context)
    }

    // Show toast notification if enabled
    if (showToast) {
      const userFriendlyMessage = ErrorHandler.getUserFriendlyMessage(normalizedError)
      showError('Error', userFriendlyMessage)
    }

    // Call custom error handler
    onError?.(normalizedError)

    return normalizedError
  }, [showToast, logError, onError, showError])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = 3
  ): Promise<T> => {
    try {
      const result = await ErrorHandler.withRetry(
        operation,
        operationId,
        {
          maxRetries,
          showToast,
          onError: (error, attempt) => {
            if (logError) {
              ErrorHandler.logError(error, { attempt, operationId })
            }
            onError?.(error)
          }
        }
      )
      
      clearError()
      return result
    } catch (error) {
      const normalizedError = ErrorHandler.normalizeError(error)
      setLastError(normalizedError)
      throw normalizedError
    }
  }, [showToast, logError, onError, clearError])

  return {
    handleError,
    clearError,
    retry,
    lastError,
    hasError: lastError !== null
  }
}

// Hook for async operations with built-in error handling
export function useAsyncOperation<T = any>() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<AppError | null>(null)
  const { handleError } = useErrorHandler()

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: AppError) => void
      showSuccessToast?: boolean
      successMessage?: string
    }
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await operation()
      setData(result)
      
      if (options?.showSuccessToast && options?.successMessage) {
        ErrorHandler.showSuccess(options.successMessage)
      }
      
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const normalizedError = handleError(err)
      setError(normalizedError)
      options?.onError?.(normalizedError)
      throw normalizedError
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const reset = useCallback(() => {
    setLoading(false)
    setData(null)
    setError(null)
  }, [])

  return {
    loading,
    data,
    error,
    execute,
    reset,
    hasError: error !== null
  }
}

// Hook for form error handling
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { handleError } = useErrorHandler({ showToast: false })

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const handleFormError = useCallback((error: unknown) => {
    const normalizedError = handleError(error)
    
    // If it's a validation error with field details, set field errors
    if (normalizedError.code === 'VALIDATION_ERROR' && normalizedError.details?.fields) {
      const fields = normalizedError.details.fields as Record<string, string>
      setFieldErrors(fields)
    }

    return normalizedError
  }, [handleError])

  const getFieldError = useCallback((field: string) => {
    return fieldErrors[field]
  }, [fieldErrors])

  const hasFieldError = useCallback((field: string) => {
    return Boolean(fieldErrors[field])
  }, [fieldErrors])

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleFormError,
    getFieldError,
    hasFieldError,
    hasErrors: Object.keys(fieldErrors).length > 0
  }
}

// Hook for network status monitoring
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        ErrorHandler.showSuccess('Connection restored', {
          description: 'You\'re back online!'
        })
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      ErrorHandler.showWarning('Connection lost', 'You\'re currently offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}