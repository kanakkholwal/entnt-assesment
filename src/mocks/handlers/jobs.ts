import { http } from 'msw'
import { jobsService } from '../../db/services'
import { 
  simulateDelay, 
  shouldSimulateError, 
  createErrorResponse, 
  createSuccessResponse,
  logRequest,
  parseQueryParams,
  validateRequiredFields
} from '../utils'
import type { CreateJobRequest, UpdateJobRequest } from '../../types'

export const jobHandlers = [
  // GET /api/jobs - List jobs with pagination and filtering
  http.get('/api/jobs', async ({ request }) => {
    const url = new URL(request.url)
    logRequest('GET', '/api/jobs', url.searchParams.toString())
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch jobs', 500)
    }
    
    try {
      const params = parseQueryParams(url)
      const filters = {
        search: params.search,
        status: params.status,
        tags: params.tags,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
      
      const result = await jobsService.list({
        page: params.page,
        limit: params.limit,
        filters
      })
      
      return createSuccessResponse(result)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/jobs/:id - Get job by ID
  http.get('/api/jobs/:id', async ({ params }) => {
    const { id } = params
    logRequest('GET', `/api/jobs/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch job', 500)
    }
    
    try {
      const job = await jobsService.getById(id as string)
      
      if (!job) {
        return createErrorResponse('Job not found', 404)
      }
      
      return createSuccessResponse(job)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // POST /api/jobs - Create new job
  http.post('/api/jobs', async ({ request }) => {
    logRequest('POST', '/api/jobs')
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to create job', 500)
    }
    
    try {
      const jobData = await request.json() as CreateJobRequest
      
      // Validate required fields
      const validationError = validateRequiredFields(jobData, ['title'])
      if (validationError) {
        return createErrorResponse(validationError, 400)
      }
      
      // Check for duplicate slug
      if (jobData.slug) {
        const existingJob = await jobsService.getBySlug(jobData.slug)
        if (existingJob) {
          return createErrorResponse('Job with this slug already exists', 409)
        }
      }
      
      const job = await jobsService.create(jobData)
      return createSuccessResponse(job, 201)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // PUT /api/jobs/:id - Update job
  http.put('/api/jobs/:id', async ({ params, request }) => {
    const { id } = params
    logRequest('PUT', `/api/jobs/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to update job', 500)
    }
    
    try {
      const updates = await request.json() as UpdateJobRequest
      
      // Check if job exists
      const existingJob = await jobsService.getById(id as string)
      if (!existingJob) {
        return createErrorResponse('Job not found', 404)
      }
      
      // Check for duplicate slug if updating
      if (updates.slug && updates.slug !== existingJob.slug) {
        const duplicateJob = await jobsService.getBySlug(updates.slug)
        if (duplicateJob) {
          return createErrorResponse('Job with this slug already exists', 409)
        }
      }
      
      const updatedJob = await jobsService.update(id as string, updates)
      return createSuccessResponse(updatedJob)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // DELETE /api/jobs/:id - Delete job
  http.delete('/api/jobs/:id', async ({ params }) => {
    const { id } = params
    logRequest('DELETE', `/api/jobs/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to delete job', 500)
    }
    
    try {
      const existingJob = await jobsService.getById(id as string)
      if (!existingJob) {
        return createErrorResponse('Job not found', 404)
      }
      
      await jobsService.delete(id as string)
      return createSuccessResponse({ message: 'Job deleted successfully' })
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // POST /api/jobs/:id/reorder - Reorder job
  http.post('/api/jobs/:id/reorder', async ({ params, request }) => {
    const { id } = params
    logRequest('POST', `/api/jobs/${id}/reorder`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to reorder job', 500)
    }
    
    try {
      const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number }
      
      // Validate required fields
      if (typeof fromOrder !== 'number' || typeof toOrder !== 'number') {
        return createErrorResponse('fromOrder and toOrder must be numbers', 400)
      }
      
      const existingJob = await jobsService.getById(id as string)
      if (!existingJob) {
        return createErrorResponse('Job not found', 404)
      }
      
      await jobsService.reorder(id as string, fromOrder, toOrder)
      return createSuccessResponse({ message: 'Job reordered successfully' })
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  })
]