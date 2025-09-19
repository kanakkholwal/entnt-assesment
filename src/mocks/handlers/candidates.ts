import { http } from 'msw'
import { candidatesService } from '../../db/services'
import { 
  simulateDelay, 
  shouldSimulateError, 
  createErrorResponse, 
  createSuccessResponse,
  logRequest,
  parseQueryParams,
  validateRequiredFields
} from '../utils'
import type { CreateCandidateRequest, UpdateCandidateRequest, AddCandidateNoteRequest } from '../../types'

export const candidateHandlers = [
  // GET /api/candidates - List candidates with pagination and filtering
  http.get('/api/candidates', async ({ request }) => {
    const url = new URL(request.url)
    logRequest('GET', '/api/candidates', url.searchParams.toString())
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch candidates', 500)
    }
    
    try {
      const params = parseQueryParams(url)
      const filters = {
        search: params.search,
        stage: params.stage,
        jobId: params.jobId,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }
      
      const result = await candidatesService.list({
        page: params.page,
        limit: params.limit,
        filters
      })
      
      return createSuccessResponse(result)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/candidates/:id - Get candidate by ID
  http.get('/api/candidates/:id', async ({ params }) => {
    const { id } = params
    logRequest('GET', `/api/candidates/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch candidate', 500)
    }
    
    try {
      const candidate = await candidatesService.getById(id as string)
      
      if (!candidate) {
        return createErrorResponse('Candidate not found', 404)
      }
      
      return createSuccessResponse(candidate)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // POST /api/candidates - Create new candidate
  http.post('/api/candidates', async ({ request }) => {
    logRequest('POST', '/api/candidates')
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to create candidate', 500)
    }
    
    try {
      const candidateData = await request.json() as CreateCandidateRequest
      
      // Validate required fields
      const validationError = validateRequiredFields(candidateData, ['name', 'email', 'jobId'])
      if (validationError) {
        return createErrorResponse(validationError, 400)
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(candidateData.email)) {
        return createErrorResponse('Invalid email format', 400)
      }
      
      const candidate = await candidatesService.create(candidateData)
      return createSuccessResponse(candidate, 201)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // PUT /api/candidates/:id - Update candidate
  http.put('/api/candidates/:id', async ({ params, request }) => {
    const { id } = params
    logRequest('PUT', `/api/candidates/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to update candidate', 500)
    }
    
    try {
      const updates = await request.json() as UpdateCandidateRequest
      
      // Check if candidate exists
      const existingCandidate = await candidatesService.getById(id as string)
      if (!existingCandidate) {
        return createErrorResponse('Candidate not found', 404)
      }
      
      // Validate email format if updating email
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(updates.email)) {
          return createErrorResponse('Invalid email format', 400)
        }
      }
      
      const updatedCandidate = await candidatesService.update(id as string, updates)
      return createSuccessResponse(updatedCandidate)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // DELETE /api/candidates/:id - Delete candidate
  http.delete('/api/candidates/:id', async ({ params }) => {
    const { id } = params
    logRequest('DELETE', `/api/candidates/${id}`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to delete candidate', 500)
    }
    
    try {
      const existingCandidate = await candidatesService.getById(id as string)
      if (!existingCandidate) {
        return createErrorResponse('Candidate not found', 404)
      }
      
      await candidatesService.delete(id as string)
      return createSuccessResponse({ message: 'Candidate deleted successfully' })
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/candidates/:id/timeline - Get candidate timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    const { id } = params
    logRequest('GET', `/api/candidates/${id}/timeline`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch candidate timeline', 500)
    }
    
    try {
      const candidate = await candidatesService.getById(id as string)
      if (!candidate) {
        return createErrorResponse('Candidate not found', 404)
      }
      
      const timeline = await candidatesService.getTimeline(id as string)
      return createSuccessResponse(timeline)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // POST /api/candidates/:id/notes - Add note to candidate
  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    const { id } = params
    logRequest('POST', `/api/candidates/${id}/notes`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to add candidate note', 500)
    }
    
    try {
      const noteData = await request.json() as Omit<AddCandidateNoteRequest, 'candidateId'>
      
      // Validate required fields
      const validationError = validateRequiredFields(noteData, ['content'])
      if (validationError) {
        return createErrorResponse(validationError, 400)
      }
      
      // Check if candidate exists
      const existingCandidate = await candidatesService.getById(id as string)
      if (!existingCandidate) {
        return createErrorResponse('Candidate not found', 404)
      }
      
      const note = await candidatesService.addNote({
        candidateId: id as string,
        content: noteData.content,
        mentions: noteData.mentions
      })
      
      return createSuccessResponse(note, 201)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/candidates/:id/notes - Get candidate notes
  http.get('/api/candidates/:id/notes', async ({ params }) => {
    const { id } = params
    logRequest('GET', `/api/candidates/${id}/notes`)
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch candidate notes', 500)
    }
    
    try {
      const candidate = await candidatesService.getById(id as string)
      if (!candidate) {
        return createErrorResponse('Candidate not found', 404)
      }
      
      const notes = await candidatesService.getNotes(id as string)
      return createSuccessResponse(notes)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  }),

  // GET /api/jobs/:jobId/candidates - Get candidates by job ID
  http.get('/api/jobs/:jobId/candidates', async ({ params, request }) => {
    const { jobId } = params
    const url = new URL(request.url)
    logRequest('GET', `/api/jobs/${jobId}/candidates`, url.searchParams.toString())
    
    await simulateDelay()
    
    if (shouldSimulateError()) {
      return createErrorResponse('Failed to fetch job candidates', 500)
    }
    
    try {
      const candidates = await candidatesService.getByJobId(jobId as string)
      return createSuccessResponse(candidates)
    } catch (error) {
      return createErrorResponse('Internal server error', 500)
    }
  })
]