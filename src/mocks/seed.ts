import { DatabaseSeeder } from '../db/seed'
import { DatabaseUtils } from '../db/services'

// Initialize mock data when MSW starts
export const initializeMockData = async (): Promise<void> => {
  try {
    console.log('[MSW] Initializing mock data...')
    
    // Ensure database is initialized first
    const { DatabaseInitializer } = await import('../db/init')
    if (!DatabaseInitializer.isInitialized()) {
      console.log('[MSW] Database not initialized, initializing now...')
      await DatabaseInitializer.initialize()
    }
    
    // Check if we need to seed the database
    console.log('[MSW] Checking if database needs seeding...')
    const needsSeeding = await DatabaseSeeder.needsSeeding()
    
    if (needsSeeding) {
      console.log('[MSW] Database is empty, seeding with mock data...')
      await DatabaseSeeder.seedAll()
      console.log('[MSW] Mock data seeding completed')
    } else {
      console.log('[MSW] Database already contains data, skipping seeding')
    }
  } catch (error) {
    console.error('[MSW] Failed to initialize mock data:', error)
    console.error('[MSW] Error details:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

// Export seeding function for manual use
export const seedMockData = () => DatabaseSeeder.seedAll()
export const clearMockData = () => DatabaseUtils.clearAll()
export const resetMockData = async () => {
  await clearMockData()
  await seedMockData()
}