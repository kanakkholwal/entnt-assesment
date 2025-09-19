import { 
  jobsService, 
  candidatesService, 
  assessmentsService,
  DatabaseUtils
} from './services'
import { DatabaseSeeder } from './seed'
import type { CreateJobRequest, CreateCandidateRequest } from '../types'

// Simple test functions to verify database functionality
export class DatabaseTester {
  // Test basic CRUD operations
  static async testBasicOperations(): Promise<void> {
    console.log('Testing basic database operations...')
    
    try {
      // Clear database
      await DatabaseUtils.clearAll()
      
      // Test job creation
      const jobData: CreateJobRequest = {
        title: 'Test Developer',
        description: 'A test job for database verification',
        tags: ['Test', 'Database']
      }
      
      const job = await jobsService.create(jobData)
      console.log('✓ Job created:', job.title)
      
      // Test job retrieval
      const retrievedJob = await jobsService.getById(job.id)
      console.log('✓ Job retrieved:', retrievedJob?.title)
      
      // Test candidate creation
      const candidateData: CreateCandidateRequest = {
        name: 'Test Candidate',
        email: 'test@example.com',
        jobId: job.id
      }
      
      const candidate = await candidatesService.create(candidateData)
      console.log('✓ Candidate created:', candidate.name)
      
      // Test candidate note
      await candidatesService.addNote({
        candidateId: candidate.id,
        content: 'This is a test note'
      })
      console.log('✓ Candidate note added')
      
      // Test assessment creation
      const assessment = await assessmentsService.create({
        jobId: job.id,
        title: 'Test Assessment',
        sections: [
          {
            title: 'Test Section',
            questions: [
              {
                id: crypto.randomUUID(),
                type: 'short-text',
                title: 'What is your name?',
                required: true,
                order: 0
              }
            ],
            order: 0
          }
        ]
      })
      console.log('✓ Assessment created:', assessment.title)
      
      // Test statistics
      const stats = await DatabaseUtils.getStats()
      console.log('✓ Database stats:', stats)
      
      console.log('All basic operations completed successfully!')
      
    } catch (error) {
      console.error('Database test failed:', error)
      throw error
    }
  }

  // Test seeding functionality
  static async testSeeding(): Promise<void> {
    console.log('Testing database seeding...')
    
    try {
      await DatabaseSeeder.seedAll()
      
      const stats = await DatabaseUtils.getStats()
      console.log('✓ Seeding completed:', stats)
      
      // Verify we have the expected data
      if (stats.jobs >= 25 && stats.candidates >= 1000) {
        console.log('✓ Seeding verification passed')
      } else {
        throw new Error('Seeding verification failed: insufficient data')
      }
      
    } catch (error) {
      console.error('Seeding test failed:', error)
      throw error
    }
  }

  // Test pagination and filtering
  static async testPaginationAndFiltering(): Promise<void> {
    console.log('Testing pagination and filtering...')
    
    try {
      // Test job pagination
      const jobsPage1 = await jobsService.list({ page: 1, limit: 5 })
      console.log('✓ Jobs pagination:', jobsPage1.pagination)
      
      // Test job filtering
      const activeJobs = await jobsService.list({ 
        filters: { status: 'active' } 
      })
      console.log('✓ Active jobs filtered:', activeJobs.data.length)
      
      // Test candidate pagination
      const candidatesPage1 = await candidatesService.list({ page: 1, limit: 10 })
      console.log('✓ Candidates pagination:', candidatesPage1.pagination)
      
      // Test candidate filtering by stage
      const appliedCandidates = await candidatesService.list({
        filters: { stage: 'applied' }
      })
      console.log('✓ Applied candidates filtered:', appliedCandidates.data.length)
      
      console.log('Pagination and filtering tests completed successfully!')
      
    } catch (error) {
      console.error('Pagination and filtering test failed:', error)
      throw error
    }
  }

  // Run all tests
  static async runAllTests(): Promise<void> {
    console.log('Starting comprehensive database tests...')
    
    try {
      await this.testBasicOperations()
      await this.testSeeding()
      await this.testPaginationAndFiltering()
      
      console.log('🎉 All database tests passed!')
      
    } catch (error) {
      console.error('❌ Database tests failed:', error)
      throw error
    }
  }
}

export const databaseTester = new DatabaseTester()

// Export test function for easy access
export const runDatabaseTests = () => DatabaseTester.runAllTests()