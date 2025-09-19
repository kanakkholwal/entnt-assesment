import { delay, HttpResponse } from 'msw'

// Mock API configuration
export const MOCK_CONFIG = {
  baseDelay: 200,
  maxDelay: 1200,
  errorRate: 0.08, // 8% error rate
  enableLogging: true
}

// Generate random delay between baseDelay and maxDelay
export const getRandomDelay = (): number => {
  const { baseDelay, maxDelay } = MOCK_CONFIG
  return Math.floor(Math.random() * (maxDelay - baseDelay + 1)) + baseDelay
}

// Simulate network delay
export const simulateDelay = async (): Promise<void> => {
  const delayMs = getRandomDelay()
  if (MOCK_CONFIG.enableLogging) {
    console.log(`[MSW] Simulating ${delayMs}ms delay`)
  }
  await delay(delayMs)
}

// Simulate random errors
export const shouldSimulateError = (): boolean => {
  return Math.random() < MOCK_CONFIG.errorRate
}

// Create error response
export const createErrorResponse = (message: string, status: number = 500) => {
  if (MOCK_CONFIG.enableLogging) {
    console.log(`[MSW] Simulating error: ${message}`)
  }
  
  return HttpResponse.json(
    {
      success: false,
      error: message,
      code: `ERROR_${status}`,
      retryable: status >= 500
    },
    { status }
  )
}

// Create success response
export const createSuccessResponse = <T>(data: T, status: number = 200) => {
  return HttpResponse.json(
    {
      success: true,
      data
    },
    { status }
  )
}

// Log API request
export const logRequest = (method: string, url: string, params?: any) => {
  if (MOCK_CONFIG.enableLogging) {
    console.log(`[MSW] ${method} ${url}`, params ? { params } : '')
  }
}

// Validate required fields
export const validateRequiredFields = (data: any, requiredFields: string[]): string | null => {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${field}`
    }
  }
  return null
}

// Parse query parameters
export const parseQueryParams = (url: URL) => {
  const params: Record<string, any> = {}
  
  // Parse pagination
  params.page = parseInt(url.searchParams.get('page') || '1')
  params.limit = parseInt(url.searchParams.get('limit') || '10')
  
  // Parse search
  const search = url.searchParams.get('search')
  if (search) params.search = search
  
  // Parse sorting
  const sortBy = url.searchParams.get('sortBy')
  if (sortBy) params.sortBy = sortBy
  
  const sortOrder = url.searchParams.get('sortOrder')
  if (sortOrder) params.sortOrder = sortOrder
  
  // Parse filters
  const status = url.searchParams.get('status')
  if (status) params.status = status
  
  const stage = url.searchParams.get('stage')
  if (stage) params.stage = stage
  
  const jobId = url.searchParams.get('jobId')
  if (jobId) params.jobId = jobId
  
  const tags = url.searchParams.get('tags')
  if (tags) params.tags = tags.split(',')
  
  return params
}

// Retry mechanism helper
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff
      const delayMs = baseDelay * Math.pow(2, attempt - 1)
      await delay(delayMs)
      
      if (MOCK_CONFIG.enableLogging) {
        console.log(`[MSW] Retry attempt ${attempt} after ${delayMs}ms delay`)
      }
    }
  }
  
  throw lastError!
}