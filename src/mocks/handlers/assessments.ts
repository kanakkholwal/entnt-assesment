import { http } from 'msw'
import { assessmentsService, assessmentResponsesService } from '../../db/services'
import { 
  simulateDelay, 
  shouldSimulateError, 
  createErrorResponse, 
  createSuccessResponse,
  logRequest,
  parseQueryParams,
  validateRequiredFields
} from '../utils'
import type { CreateAssessmentRequest, UpdateAssessmentRequest, AssessmentResponse } from '../../types'

export const assessmentHandlers = [
  // GET /api/assessments - List assessments with pagination and filtering
  http.get('/api/assessments', async ({ request }) => {
    const url = new URL(request.url)
    logRequest('GET', '/api/assessments', url.searchParams.toString())
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch assessments', 500)
    }
    
    try {
      const params = parseQueryParams(url)
      
      const result = await assessmentsService.list({
        page: params.page,
        limit: params.limit,
        jobId: params.jobId
      })
      
      return createSuccessResponse(result)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/assessments/:id - Get assessment by ID
  http.get('/api/assessments/:id', async ({ params }) => {
    const { id } = params
    logRequest('GET', `/api/assessments/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch assessment', 500)
    }
    
    try {
      const assessment = await assessmentsService.getById(id as string)
      
      if (!assessment) {
        return createErrorResponse('Assessment not found', 404)
      }
      
      return createSuccessResponse(assessment)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/jobs/:jobId/assessment - Get assessment by job ID
  http.get('/api/jobs/:jobId/assessment', async ({ params }) => {
    const { jobId } = params
    logRequest('GET', `/api/jobs/${jobId}/assessment`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch job assessment', 500)
    }
    
    try {
      const assessment = await assessmentsService.getByJobId(jobId as string)
      
      if (!assessment) {
        return createErrorResponse('Assessment not found for this job', 404)
      }
      
      return createSuccessResponse(assessment)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // POST /api/assessments - Create new assessment
  http.post('/api/assessments', async ({ request }) => {
    logRequest('POST', '/api/assessments')
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to create assessment', 500)
    }
    
    try {
      const assessmentData = await request.json() as CreateAssessmentRequest
      
      // Validate required fields
      const validationError = validateRequiredFields(assessmentData, ['jobId', 'title'])
      if (validationError) {
        return createErrorResponse(validationError, 400)
      }
      
      const assessment = await assessmentsService.create(assessmentData)
      return createSuccessResponse(assessment, 201)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // PUT /api/assessments/:id - Update assessment
  http.put('/api/assessments/:id', async ({ params, request }) => {
    const { id } = params
    logRequest('PUT', `/api/assessments/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to update assessment', 500)
    }
    
    try {
      const updates = await request.json() as UpdateAssessmentRequest
      
      // Check if assessment exists
      const existingAssessment = await assessmentsService.getById(id as string)
      if (!existingAssessment) {
        return createErrorResponse('Assessment not found', 404)
      }
      
      const updatedAssessment = await assessmentsService.update(id as string, updates)
      return createSuccessResponse(updatedAssessment)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // PUT /api/jobs/:jobId/assessment - Update assessment by job ID
  http.put('/api/jobs/:jobId/assessment', async ({ params, request }) => {
    const { jobId } = params
    logRequest('PUT', `/api/jobs/${jobId}/assessment`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to update job assessment', 500)
    }
    
    try {
      const updates = await request.json() as UpdateAssessmentRequest
      
      // Find assessment by job ID
      const existingAssessment = await assessmentsService.getByJobId(jobId as string)
      if (!existingAssessment) {
        return createErrorResponse('Assessment not found for this job', 404)
      }
      
      const updatedAssessment = await assessmentsService.update(existingAssessment.id, updates)
      return createSuccessResponse(updatedAssessment)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // DELETE /api/assessments/:id - Delete assessment
  http.delete('/api/assessments/:id', async ({ params }) => {
    const { id } = params
    logRequest('DELETE', `/api/assessments/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to delete assessment', 500)
    }
    
    try {
      const existingAssessment = await assessmentsService.getById(id as string)
      if (!existingAssessment) {
        return createErrorResponse('Assessment not found', 404)
      }
      
      await assessmentsService.delete(id as string)
      return createSuccessResponse({ message: 'Assessment deleted successfully' })
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // POST /api/assessment-responses - Submit assessment response
  http.post('/api/assessment-responses', async ({ request }) => {
    logRequest('POST', '/api/assessment-responses')
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to submit assessment response', 500)
    }
    
    try {
      const responseData = await request.json() as Omit<AssessmentResponse, 'id' | 'submittedAt'>
      
      // Validate required fields
      const validationError = validateRequiredFields(responseData, ['assessmentId', 'candidateId', 'responses'])
      if (validationError) {
        return createErrorResponse(validationError, 400)
      }
      
      // Check if assessment exists
      const assessment = await assessmentsService.getById(responseData.assessmentId)
      if (!assessment) {
        return createErrorResponse('Assessment not found', 404)
      }
      
      const response = await assessmentResponsesService.submit(responseData)
      return createSuccessResponse(response, 201)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/assessment-responses/:id - Get assessment response by ID
  http.get('/api/assessment-responses/:id', async ({ params }) => {
    const { id } = params
    logRequest('GET', `/api/assessment-responses/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch assessment response', 500)
    }
    
    try {
      const response = await assessmentResponsesService.getById(id as string)
      
      if (!response) {
        return createErrorResponse('Assessment response not found', 404)
      }
      
      return createSuccessResponse(response)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/assessments/:assessmentId/responses - Get responses by assessment ID
  http.get('/api/assessments/:assessmentId/responses', async ({ params }) => {
    const { assessmentId } = params
    logRequest('GET', `/api/assessments/${assessmentId}/responses`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch assessment responses', 500)
    }
    
    try {
      const responses = await assessmentResponsesService.getByAssessmentId(assessmentId as string)
      return createSuccessResponse(responses)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/candidates/:candidateId/assessment-responses - Get responses by candidate ID
  http.get('/api/candidates/:candidateId/assessment-responses', async ({ params }) => {
    const { candidateId } = params
    logRequest('GET', `/api/candidates/${candidateId}/assessment-responses`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch candidate assessment responses', 500)
    }
    
    try {
      const responses = await assessmentResponsesService.getByCandidateId(candidateId as string)
      return createSuccessResponse(responses)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/assessments/:assessmentId/candidates/:candidateId/response - Get specific response
  http.get('/api/assessments/:assessmentId/candidates/:candidateId/response', async ({ params }) => {
    const { assessmentId, candidateId } = params
    logRequest('GET', `/api/assessments/${assessmentId}/candidates/${candidateId}/response`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch assessment response', 500)
    }
    
    try {
      const response = await assessmentResponsesService.getByAssessmentAndCandidate(
        assessmentId as string, 
        candidateId as string
      )
      
      if (!response) {
        return createErrorResponse('Assessment response not found', 404)
      }
      
      return createSuccessResponse(response)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  })
]