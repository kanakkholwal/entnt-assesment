import type { 
  APIService,
  Job, 
  CreateJobRequest, 
  UpdateJobRequest, 
  GetJobsParams,
  Candidate,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  GetCandidatesParams,
  Assessment,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  GetAssessmentsParams,
  AssessmentResponse,
  PaginatedResponse,
  AddCandidateNoteRequest,
  CandidateNote,
  TimelineEvent
} from '../types'

// Base API configuration
const API_BASE_URL = '/api'

// Generic API error class
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data.code,
        data.retryable || response.status >= 500
      )
    }

    return data.data || data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Network or other errors
    throw new APIError(
      'Network error or server unavailable',
      0,
      'NETWORK_ERROR',
      true
    )
  }
}

// Retry mechanism with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: APIError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as APIError
      
      // Don't retry non-retryable errors or client errors
      if (!lastError.retryable || (lastError.status >= 400 && lastError.status < 500)) {
        throw lastError
      }
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Build query string from parameters
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

// API Service implementation
export class TalentFlowAPIService implements APIService {
  // Jobs API
  async getJobs(params: GetJobsParams): Promise<PaginatedResponse<Job>> {
    const queryString = buildQueryString({
      page: params.page,
      limit: params.limit,
      ...params.filters
    })
    
    return withRetry(() => 
      apiRequest<PaginatedResponse<Job>>(`/jobs?${queryString}`)
    )
  }

  async getJob(id: string): Promise<Job> {
    return withRetry(() => 
      apiRequest<Job>(`/jobs/${id}`)
    )
  }

  async createJob(job: CreateJobRequest): Promise<Job> {
    return withRetry(() => 
      apiRequest<Job>('/jobs', {
        method: 'POST',
        body: JSON.stringify(job)
      })
    )
  }

  async updateJob(id: string, updates: UpdateJobRequest): Promise<Job> {
    return withRetry(() => 
      apiRequest<Job>(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    )
  }

  async deleteJob(id: string): Promise<void> {
    return withRetry(() => 
      apiRequest<void>(`/jobs/${id}`, {
        method: 'DELETE'
      })
    )
  }

  async reorderJob(id: string, fromOrder: number, toOrder: number): Promise<void> {
    return withRetry(() => 
      apiRequest<void>(`/jobs/${id}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ fromOrder, toOrder })
      })
    )
  }

  // Candidates API
  async getCandidates(params: GetCandidatesParams): Promise<PaginatedResponse<Candidate>> {
    const queryString = buildQueryString({
      page: params.page,
      limit: params.limit,
      ...params.filters
    })
    
    return withRetry(() => 
      apiRequest<PaginatedResponse<Candidate>>(`/candidates?${queryString}`)
    )
  }

  async getCandidate(id: string): Promise<Candidate> {
    return withRetry(() => 
      apiRequest<Candidate>(`/candidates/${id}`)
    )
  }

  async createCandidate(candidate: CreateCandidateRequest): Promise<Candidate> {
    return withRetry(() => 
      apiRequest<Candidate>('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidate)
      })
    )
  }

  async updateCandidate(id: string, updates: UpdateCandidateRequest): Promise<Candidate> {
    return withRetry(() => 
      apiRequest<Candidate>(`/candidates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    )
  }

  async deleteCandidate(id: string): Promise<void> {
    return withRetry(() => 
      apiRequest<void>(`/candidates/${id}`, {
        method: 'DELETE'
      })
    )
  }

  async getCandidateTimeline(id: string): Promise<TimelineEvent[]> {
    return withRetry(() => 
      apiRequest<TimelineEvent[]>(`/candidates/${id}/timeline`)
    )
  }

  async addCandidateNote(noteData: AddCandidateNoteRequest): Promise<CandidateNote> {
    return withRetry(() => 
      apiRequest<CandidateNote>(`/candidates/${noteData.candidateId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          content: noteData.content,
          mentions: noteData.mentions
        })
      })
    )
  }

  async getCandidateNotes(id: string): Promise<CandidateNote[]> {
    return withRetry(() => 
      apiRequest<CandidateNote[]>(`/candidates/${id}/notes`)
    )
  }

  async getCandidatesByJob(jobId: string): Promise<Candidate[]> {
    return withRetry(() => 
      apiRequest<Candidate[]>(`/jobs/${jobId}/candidates`)
    )
  }

  // Assessments API
  async getAssessments(params: GetAssessmentsParams): Promise<PaginatedResponse<Assessment>> {
    const queryString = buildQueryString({
      page: params.page,
      limit: params.limit,
      ...params.filters
    })
    
    return withRetry(() => 
      apiRequest<PaginatedResponse<Assessment>>(`/assessments?${queryString}`)
    )
  }

  async getAssessment(jobId: string): Promise<Assessment> {
    return withRetry(() => 
      apiRequest<Assessment>(`/jobs/${jobId}/assessment`)
    )
  }

  async createAssessment(assessment: CreateAssessmentRequest): Promise<Assessment> {
    return withRetry(() => 
      apiRequest<Assessment>('/assessments', {
        method: 'POST',
        body: JSON.stringify(assessment)
      })
    )
  }

  async updateAssessment(jobId: string, assessment: UpdateAssessmentRequest): Promise<Assessment> {
    return withRetry(() => 
      apiRequest<Assessment>(`/jobs/${jobId}/assessment`, {
        method: 'PUT',
        body: JSON.stringify(assessment)
      })
    )
  }

  async deleteAssessment(id: string): Promise<void> {
    return withRetry(() => 
      apiRequest<void>(`/assessments/${id}`, {
        method: 'DELETE'
      })
    )
  }

  async submitAssessmentResponse(response: Omit<AssessmentResponse, 'id' | 'submittedAt'>): Promise<void> {
    return withRetry(() => 
      apiRequest<void>('/assessment-responses', {
        method: 'POST',
        body: JSON.stringify(response)
      })
    )
  }

  async getAssessmentResponse(assessmentId: string, candidateId: string): Promise<AssessmentResponse> {
    return withRetry(() => 
      apiRequest<AssessmentResponse>(`/assessments/${assessmentId}/candidates/${candidateId}/response`)
    )
  }

  async getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
    return withRetry(() => 
      apiRequest<AssessmentResponse[]>(`/assessments/${assessmentId}/responses`)
    )
  }

  async getCandidateAssessmentResponses(candidateId: string): Promise<AssessmentResponse[]> {
    return withRetry(() => 
      apiRequest<AssessmentResponse[]>(`/candidates/${candidateId}/assessment-responses`)
    )
  }
}

// Export singleton instance
export const apiService = new TalentFlowAPIService()

// APIError is already exported above