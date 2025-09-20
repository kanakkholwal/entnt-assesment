// Development utilities for MSW testing and debugging
import { runAllMSWTests } from './test'
import { seedMockData, clearMockData, resetMockData } from './seed'
import { apiService } from '../services/api'
import { MOCK_CONFIG } from './utils'

// Expose utilities to window for browser console access
declare global {
  interface Window {
    mswUtils: {
      // Testing
      runTests: () => Promise<void>
      testAPI: typeof apiService

      // Data management
      seedData: () => Promise<void>
      clearData: () => Promise<void>
      resetData: () => Promise<void>

      // Configuration
      getConfig: () => typeof MOCK_CONFIG
      setErrorRate: (rate: number) => void
      setLogging: (enabled: boolean) => void

      // Quick API tests
      getJobs: (params?: any) => Promise<any>
      getCandidates: (params?: any) => Promise<any>
      getAssessments: (params?: any) => Promise<any>
    }
  }
}

// Initialize development utilities
export const initDevUtils = (): void => {
  if (typeof window !== 'undefined') {
    window.mswUtils = {
      // Testing
      runTests: runAllMSWTests,
      testAPI: apiService,

      // Data management
      seedData: seedMockData,
      clearData: clearMockData,
      resetData: resetMockData,

      // Configuration
      getConfig: () => MOCK_CONFIG,
      setErrorRate: (rate: number) => {
        MOCK_CONFIG.errorRate = Math.max(0, Math.min(1, rate))
        console.log(`[MSW] Error rate set to ${(MOCK_CONFIG.errorRate * 100).toFixed(1)}%`)
      },
      setLogging: (enabled: boolean) => {
        MOCK_CONFIG.enableLogging = enabled
        console.log(`[MSW] Logging ${enabled ? 'enabled' : 'disabled'}`)
      },

      // Quick API tests
      getJobs: (params = {}) => apiService.getJobs({ page: 1, limit: 10, ...params }),
      getCandidates: (params = {}) => apiService.getCandidates({ page: 1, limit: 10, ...params }),
      getAssessments: (params = {}) => apiService.getAssessments({ page: 1, limit: 10, ...params })
    }

    if (process.env.NODE_ENV === 'development')
      console.log(`
🔧 MSW Development Utils Available!

Use these commands in the browser console:

📊 Testing:
  mswUtils.runTests()                    - Run all MSW tests
  mswUtils.getJobs()                     - Quick jobs API test
  mswUtils.getCandidates()               - Quick candidates API test
  mswUtils.getAssessments()              - Quick assessments API test

🗄️ Data Management:
  mswUtils.seedData()                    - Seed database with mock data
  mswUtils.clearData()                   - Clear all data
  mswUtils.resetData()                   - Clear and re-seed data

⚙️ Configuration:
  mswUtils.getConfig()                   - View current MSW config
  mswUtils.setErrorRate(0.1)             - Set error rate (0-1)
  mswUtils.setLogging(true/false)        - Enable/disable logging

🔍 API Service:
  mswUtils.testAPI                       - Full API service object
    `)
  }
}

// Export for manual initialization
export { runAllMSWTests, seedMockData, clearMockData, resetMockData }