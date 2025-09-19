import { setupWorker } from 'msw/browser'
import { handlers } from './handlers/index'
import { initializeMockData } from './seed'
import { initDevUtils } from './dev-utils'

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers)

// Initialize mock data function
let dataInitialized = false

export const initializeDataOnce = async () => {
  if (!dataInitialized) {
    try {
      console.log('[MSW] Starting data initialization...')
      await initializeMockData()
      dataInitialized = true
      
      // Initialize development utilities
      initDevUtils()
      console.log('[MSW] Data initialization completed successfully')
    } catch (error) {
      console.error('[MSW] Failed to initialize mock data:', error)
      throw error // Re-throw to see the actual error
    }
  }
}

// Export data management functions
export { initializeMockData, seedMockData, clearMockData, resetMockData } from './seed'