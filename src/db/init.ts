import { db } from './index'

// Database initialization and setup
export class DatabaseInitializer {
  private static initialized = false

  // Initialize the database
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      console.log('Starting database initialization...')
      
      // Open the database connection
      await db.open()
      
      console.log('Database connection established')
      
      this.initialized = true
      console.log('Database initialization completed')
    } catch (error) {
      console.error('Database initialization failed:', error)
      throw error
    }
  }

  // Check if database is ready
  static isInitialized(): boolean {
    return this.initialized
  }

  // Reset database (useful for development/testing)
  static async reset(): Promise<void> {
    try {
      await db.delete()
      this.initialized = false
      await this.initialize()
      console.log('Database reset completed')
    } catch (error) {
      console.error('Database reset failed:', error)
      throw error
    }
  }

  // Close database connection
  static async close(): Promise<void> {
    try {
      await db.close()
      this.initialized = false
      console.log('Database connection closed')
    } catch (error) {
      console.error('Failed to close database:', error)
      throw error
    }
  }
}

// Don't auto-initialize to avoid circular dependency issues
// Initialize manually when needed

export const databaseInitializer = new DatabaseInitializer()