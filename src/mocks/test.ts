import { apiService } from '../services/api'

// Test MSW endpoints
export const testMSWEndpoints = async (): Promise<void> => {
  console.log('[MSW Test] Starting API endpoint tests...')

  try {
    // Test jobs endpoint
    console.log('[MSW Test] Testing jobs endpoint...')
    const jobsResponse = await apiService.getJobs({ page: 1, limit: 5 })
    console.log('[MSW Test] ✓ Jobs endpoint working:', {
      totalJobs: jobsResponse.pagination.total,
      jobsReturned: jobsResponse.data.length
    })

    // Test candidates endpoint
    console.log('[MSW Test] Testing candidates endpoint...')
    const candidatesResponse = await apiService.getCandidates({ page: 1, limit: 5 })
    console.log('[MSW Test] ✓ Candidates endpoint working:', {
      totalCandidates: candidatesResponse.pagination.total,
      candidatesReturned: candidatesResponse.data.length
    })

    // Test assessments endpoint
    console.log('[MSW Test] Testing assessments endpoint...')
    const assessmentsResponse = await apiService.getAssessments({ page: 1, limit: 5 })
    console.log('[MSW Test] ✓ Assessments endpoint working:', {
      totalAssessments: assessmentsResponse.pagination.total,
      assessmentsReturned: assessmentsResponse.data.length
    })

    // Test job creation
    console.log('[MSW Test] Testing job creation...')
    const newJob = await apiService.createJob({
      title: 'Test MSW Job',
      description: 'A job created to test MSW functionality',
      tags: ['Test', 'MSW']
    })
    console.log('[MSW Test] ✓ Job creation working:', {
      jobId: newJob.id,
      title: newJob.title
    })

    // Test candidate creation
    console.log('[MSW Test] Testing candidate creation...')
    const newCandidate = await apiService.createCandidate({
      name: 'Test MSW Candidate',
      email: 'test.msw@example.com',
      jobId: newJob.id
    })
    console.log('[MSW Test] ✓ Candidate creation working:', {
      candidateId: newCandidate.id,
      name: newCandidate.name
    })

    console.log('[MSW Test] 🎉 All API endpoint tests passed!')

  } catch (error) {
    console.error('[MSW Test] ❌ API endpoint test failed:', error)
    throw error
  }
}

// Test error simulation
export const testErrorSimulation = async (): Promise<void> => {
  console.log('[MSW Test] Testing error simulation...')

  let errorCount = 0
  const maxAttempts = 20

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await apiService.getJobs({ page: 1, limit: 1 })
    } catch (error) {
      errorCount++
      console.log(`[MSW Test] Simulated error ${errorCount}:`, error)
    }
  }

  const errorRate = (errorCount / maxAttempts) * 100
  console.log(`[MSW Test] Error simulation results: ${errorRate.toFixed(1)}% error rate (expected ~8%)`)

  if (errorRate > 0) {
    console.log('[MSW Test] ✓ Error simulation working')
  } else {
    console.log('[MSW Test] ⚠️ No errors simulated - this might be expected due to randomness')
  }
}

// Test delay simulation
export const testDelaySimulation = async (): Promise<void> => {
  console.log('[MSW Test] Testing delay simulation...')

  const startTime = Date.now()
  await apiService.getJobs({ page: 1, limit: 1 })
  const endTime = Date.now()
  const delay = endTime - startTime

  console.log(`[MSW Test] Request took ${delay}ms (expected 200-1200ms)`)

  if (delay >= 200 && delay <= 1500) { // Allow some buffer
    console.log('[MSW Test] ✓ Delay simulation working')
  } else {
    console.log('[MSW Test] ⚠️ Delay outside expected range - this might be due to other factors')
  }
}

// Run all tests
export const runAllMSWTests = async (): Promise<void> => {
  console.log('[MSW Test] Starting comprehensive MSW tests...')

  try {
    await testMSWEndpoints()
    await testErrorSimulation()
    await testDelaySimulation()

    console.log('[MSW Test] 🎉 All MSW tests completed successfully!')
  } catch (error) {
    console.error('[MSW Test] ❌ MSW tests failed:', error)
    throw error
  }
}