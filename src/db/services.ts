import { liveQuery } from 'dexie'
import { 
  db, 
  toDBJob, 
  fromDBJob, 
  toDBCandidate, 
  fromDBCandidate,
  toDBAssessment,
  fromDBAssessment,
  toDBAssessmentResponse,
  fromDBAssessmentResponse,
  toDBTimelineEvent,
  fromDBTimelineEvent,
  toDBCandidateNote,
  fromDBCandidateNote
} from './index'
import type {
  Job,
  Candidate,
  Assessment,
  AssessmentResponse,
  TimelineEvent,
  CandidateNote,
  CreateJobRequest,
  UpdateJobRequest,
  GetJobsParams,
  GetCandidatesParams,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  AddCandidateNoteRequest,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  PaginatedResponse,
  PaginationState
} from '../types'

// Jobs Service
export class JobsService {
  // Create a new job
  async create(jobData: CreateJobRequest): Promise<Job> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    // Generate slug if not provided
    const slug = jobData.slug || jobData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Get the highest order number and increment
    const maxOrder = await db.jobs.orderBy('order').reverse().first()
    const order = (maxOrder?.order || 0) + 1
    
    const job: Job = {
      id,
      title: jobData.title,
      slug,
      status: 'active',
      tags: jobData.tags || [],
      order,
      description: jobData.description,
      requirements: jobData.requirements,
      createdAt: now,
      updatedAt: now
    }
    
    const dbJob = toDBJob(job)
    await db.jobs.add(dbJob)
    return job
  }

  // Get job by ID
  async getById(id: string): Promise<Job | undefined> {
    const dbJob = await db.jobs.get(id)
    return dbJob ? fromDBJob(dbJob) : undefined
  }

  // Get job by slug
  async getBySlug(slug: string): Promise<Job | undefined> {
    const dbJob = await db.jobs.where('slug').equals(slug).first()
    return dbJob ? fromDBJob(dbJob) : undefined
  }

  // Update job
  async update(id: string, updates: UpdateJobRequest): Promise<Job> {
    const existing = await db.jobs.get(id)
    if (!existing) {
      throw new Error(`Job with id ${id} not found`)
    }

    const updatedData = { ...updates }
    if (updates.title && !updates.slug) {
      updatedData.slug = updates.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }

    await db.jobs.update(id, updatedData)
    const updated = await db.jobs.get(id)
    return fromDBJob(updated!)
  }

  // Delete job
  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses, db.timelineEvents, db.candidateNotes], async () => {
      // Delete related data
      const candidates = await db.candidates.where('jobId').equals(id).toArray()
      const candidateIds = candidates.map(c => c.id)
      
      // Delete candidate notes and timeline events
      await db.candidateNotes.where('candidateId').anyOf(candidateIds).delete()
      await db.timelineEvents.where('candidateId').anyOf(candidateIds).delete()
      
      // Delete assessment responses for candidates
      await db.assessmentResponses.where('candidateId').anyOf(candidateIds).delete()
      
      // Delete assessments for this job
      await db.assessments.where('jobId').equals(id).delete()
      
      // Delete candidates
      await db.candidates.where('jobId').equals(id).delete()
      
      // Finally delete the job
      await db.jobs.delete(id)
    })
  }

  // List jobs with pagination and filtering
  async list(params: GetJobsParams = {}): Promise<PaginatedResponse<Job>> {
    const { page = 1, limit = 10, filters = {} } = params
    const offset = (page - 1) * limit

    let query = db.jobs.toCollection()

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.filter(job => job.status === filters.status)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      query = query.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.slug.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.filter(job => 
        filters.tags!.some(tag => job.tags.includes(tag))
      )
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'order'
    const sortOrder = filters.sortOrder || 'asc'
    
    let sortedResults
    if (sortBy === 'order') {
      sortedResults = await query.sortBy('order')
    } else if (sortBy === 'title') {
      sortedResults = await query.sortBy('title')
    } else if (sortBy === 'createdAt') {
      sortedResults = await query.sortBy('createdAt')
    } else {
      sortedResults = await query.sortBy('order')
    }
    
    if (sortOrder === 'desc') {
      sortedResults = sortedResults.reverse()
    }

    // Get total count
    const total = await query.count()
    
    // Get paginated results
    const dbJobs = sortedResults.slice(offset, offset + limit)
    const jobs = dbJobs.map(fromDBJob)

    const pagination: PaginationState = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }

    return { data: jobs, pagination }
  }

  // Reorder jobs
  async reorder(id: string, fromOrder: number, toOrder: number): Promise<void> {
    await db.transaction('rw', db.jobs, async () => {
      const job = await db.jobs.get(id)
      if (!job) {
        throw new Error(`Job with id ${id} not found`)
      }

      if (fromOrder < toOrder) {
        // Moving down: decrease order of jobs between fromOrder and toOrder
        await db.jobs
          .where('order')
          .between(fromOrder + 1, toOrder, true, true)
          .modify((job: any) => { job.order = job.order - 1 })
      } else {
        // Moving up: increase order of jobs between toOrder and fromOrder
        await db.jobs
          .where('order')
          .between(toOrder, fromOrder - 1, true, true)
          .modify((job: any) => { job.order = job.order + 1 })
      }

      // Update the moved job's order
      await db.jobs.update(id, { order: toOrder })
    })
  }

  // Get live query for reactive updates
  getLiveQuery(params: GetJobsParams = {}) {
    return liveQuery(() => this.list(params))
  }
}

// Candidates Service
export class CandidatesService {
  // Create a new candidate
  async create(candidateData: CreateCandidateRequest): Promise<Candidate> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const candidate: Omit<Candidate, 'notes' | 'timeline'> = {
      id,
      name: candidateData.name,
      email: candidateData.email,
      stage: candidateData.stage || 'applied',
      jobId: candidateData.jobId,
      appliedAt: now
    }
    
    const dbCandidate = toDBCandidate(candidate)
    await db.candidates.add(dbCandidate)
    
    // Create initial timeline event
    await this.addTimelineEvent(id, {
      type: 'stage_change',
      description: `Candidate applied for position`,
      metadata: { stage: candidate.stage }
    })
    
    return {
      ...candidate,
      notes: [],
      timeline: await this.getTimeline(id)
    }
  }

  // Get candidate by ID with notes and timeline
  async getById(id: string): Promise<Candidate | undefined> {
    const dbCandidate = await db.candidates.get(id)
    if (!dbCandidate) return undefined
    
    const candidate = fromDBCandidate(dbCandidate)
    const notes = await this.getNotes(id)
    const timeline = await this.getTimeline(id)
    
    return {
      ...candidate,
      notes,
      timeline
    }
  }

  // Update candidate
  async update(id: string, updates: UpdateCandidateRequest): Promise<Candidate> {
    const existing = await db.candidates.get(id)
    if (!existing) {
      throw new Error(`Candidate with id ${id} not found`)
    }

    await db.candidates.update(id, updates)
    
    // If stage changed, add timeline event
    if (updates.stage && updates.stage !== existing.stage) {
      await this.addTimelineEvent(id, {
        type: 'stage_change',
        description: `Stage changed from ${existing.stage} to ${updates.stage}`,
        metadata: { 
          previousStage: existing.stage, 
          newStage: updates.stage 
        }
      })
    }
    
    const updated = await this.getById(id)
    return updated!
  }

  // Delete candidate
  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.candidates, db.candidateNotes, db.timelineEvents, db.assessmentResponses], async () => {
      await db.candidateNotes.where('candidateId').equals(id).delete()
      await db.timelineEvents.where('candidateId').equals(id).delete()
      await db.assessmentResponses.where('candidateId').equals(id).delete()
      await db.candidates.delete(id)
    })
  }

  // List candidates with pagination and filtering
  async list(params: GetCandidatesParams = {}): Promise<PaginatedResponse<Candidate>> {
    const { page = 1, limit = 10, filters = {} } = params
    const offset = (page - 1) * limit

    let query = db.candidates.toCollection()

    // Apply filters
    if (filters.stage && filters.stage !== 'all') {
      query = query.filter(candidate => candidate.stage === filters.stage)
    }

    if (filters.jobId) {
      query = query.filter(candidate => candidate.jobId === filters.jobId)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm)
      )
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'appliedAt'
    const sortOrder = filters.sortOrder || 'desc'
    
    let sortedResults
    if (sortBy === 'name') {
      sortedResults = await query.sortBy('name')
    } else if (sortBy === 'appliedAt') {
      sortedResults = await query.sortBy('appliedAt')
    } else if (sortBy === 'stage') {
      sortedResults = await query.sortBy('stage')
    } else {
      sortedResults = await query.sortBy('appliedAt')
    }
    
    if (sortOrder === 'desc') {
      sortedResults = sortedResults.reverse()
    }

    // Get total count
    const total = await query.count()
    
    // Get paginated results
    const dbCandidates = sortedResults.slice(offset, offset + limit)
    
    // Fetch notes and timeline for each candidate
    const candidates = await Promise.all(
      dbCandidates.map(async (dbCandidate: any) => {
        const candidate = fromDBCandidate(dbCandidate)
        const notes = await this.getNotes(dbCandidate.id)
        const timeline = await this.getTimeline(dbCandidate.id)
        
        return {
          ...candidate,
          notes,
          timeline
        }
      })
    )

    const pagination: PaginationState = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }

    return { data: candidates, pagination }
  }

  // Get candidates by job ID
  async getByJobId(jobId: string): Promise<Candidate[]> {
    const dbCandidates = await db.candidates.where('jobId').equals(jobId).toArray()
    
    return Promise.all(
      dbCandidates.map(async (dbCandidate) => {
        const candidate = fromDBCandidate(dbCandidate)
        const notes = await this.getNotes(dbCandidate.id)
        const timeline = await this.getTimeline(dbCandidate.id)
        
        return {
          ...candidate,
          notes,
          timeline
        }
      })
    )
  }

  // Add note to candidate
  async addNote(noteData: AddCandidateNoteRequest): Promise<CandidateNote> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const note: CandidateNote = {
      id,
      candidateId: noteData.candidateId,
      content: noteData.content,
      authorId: 'current-user', // TODO: Get from auth context
      authorName: 'Current User', // TODO: Get from auth context
      createdAt: now,
      mentions: noteData.mentions
    }
    
    const dbNote = toDBCandidateNote(note)
    await db.candidateNotes.add(dbNote)
    
    // Add timeline event
    await this.addTimelineEvent(noteData.candidateId, {
      type: 'note_added',
      description: 'Note added to candidate',
      metadata: { noteId: id }
    })
    
    return note
  }

  // Get notes for candidate
  async getNotes(candidateId: string): Promise<CandidateNote[]> {
    const dbNotes = await db.candidateNotes
      .where('candidateId')
      .equals(candidateId)
      .sortBy('createdAt')
    
    return dbNotes.map(fromDBCandidateNote)
  }

  // Add timeline event
  async addTimelineEvent(candidateId: string, eventData: Omit<TimelineEvent, 'id' | 'candidateId' | 'createdAt'>): Promise<TimelineEvent> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const event: TimelineEvent = {
      id,
      candidateId,
      createdAt: now,
      ...eventData
    }
    
    const dbEvent = toDBTimelineEvent(event)
    await db.timelineEvents.add(dbEvent)
    
    return event
  }

  // Get timeline for candidate
  async getTimeline(candidateId: string): Promise<TimelineEvent[]> {
    const dbEvents = await db.timelineEvents
      .where('candidateId')
      .equals(candidateId)
      .sortBy('createdAt')
    
    return dbEvents.map(fromDBTimelineEvent)
  }

  // Get live query for reactive updates
  getLiveQuery(params: GetCandidatesParams = {}) {
    return liveQuery(() => this.list(params))
  }
}
// Assessments Service
export class AssessmentsService {
  // Create a new assessment
  async create(assessmentData: CreateAssessmentRequest): Promise<Assessment> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const assessment: Assessment = {
      id,
      jobId: assessmentData.jobId,
      title: assessmentData.title,
      sections: assessmentData.sections?.map((section, index) => ({
        ...section,
        id: crypto.randomUUID(),
        order: index,
        questions: section.questions?.map((question, qIndex) => ({
          ...question,
          id: crypto.randomUUID(),
          order: qIndex
        })) || []
      })) || [],
      createdAt: now,
      updatedAt: now
    }
    
    const dbAssessment = toDBAssessment(assessment)
    await db.assessments.add(dbAssessment)
    
    return assessment
  }

  // Get assessment by ID
  async getById(id: string): Promise<Assessment | undefined> {
    const dbAssessment = await db.assessments.get(id)
    return dbAssessment ? fromDBAssessment(dbAssessment) : undefined
  }

  // Get assessment by job ID
  async getByJobId(jobId: string): Promise<Assessment | undefined> {
    const dbAssessment = await db.assessments.where('jobId').equals(jobId).first()
    return dbAssessment ? fromDBAssessment(dbAssessment) : undefined
  }

  // Update assessment
  async update(id: string, updates: UpdateAssessmentRequest): Promise<Assessment> {
    const existing = await db.assessments.get(id)
    if (!existing) {
      throw new Error(`Assessment with id ${id} not found`)
    }

    const updatedData = { ...updates }
    
    // Ensure section and question IDs are preserved or generated
    if (updates.sections) {
      updatedData.sections = updates.sections.map((section, index) => ({
        ...section,
        id: section.id || crypto.randomUUID(),
        order: index,
        questions: section.questions.map((question, qIndex) => ({
          ...question,
          id: question.id || crypto.randomUUID(),
          order: qIndex
        }))
      }))
    }

    await db.assessments.update(id, updatedData)
    const updated = await db.assessments.get(id)
    return fromDBAssessment(updated!)
  }

  // Delete assessment
  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.assessments, db.assessmentResponses], async () => {
      await db.assessmentResponses.where('assessmentId').equals(id).delete()
      await db.assessments.delete(id)
    })
  }

  // List assessments with pagination and filtering
  async list(params: { page?: number; limit?: number; jobId?: string } = {}): Promise<PaginatedResponse<Assessment>> {
    const { page = 1, limit = 10, jobId } = params
    const offset = (page - 1) * limit

    let query = db.assessments.toCollection()

    if (jobId) {
      query = query.filter(assessment => assessment.jobId === jobId)
    }

    // Get total count
    const total = await query.count()
    
    // Sort by creation date (newest first) and get paginated results
    const sortedResults = await query.sortBy('createdAt')
    const reversedResults = sortedResults.reverse()
    const dbAssessments = reversedResults.slice(offset, offset + limit)
    const assessments = dbAssessments.map(fromDBAssessment)

    const pagination: PaginationState = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }

    return { data: assessments, pagination }
  }

  // Get live query for reactive updates
  getLiveQuery(params: { jobId?: string } = {}) {
    return liveQuery(() => this.list(params))
  }
}

// Assessment Responses Service
export class AssessmentResponsesService {
  // Submit assessment response
  async submit(responseData: Omit<AssessmentResponse, 'id' | 'submittedAt'>): Promise<AssessmentResponse> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const response: AssessmentResponse = {
      id,
      submittedAt: now,
      ...responseData
    }
    
    const dbResponse = toDBAssessmentResponse(response)
    await db.assessmentResponses.add(dbResponse)
    
    // Add timeline event for candidate
    const candidatesService = new CandidatesService()
    await candidatesService.addTimelineEvent(responseData.candidateId, {
      type: 'assessment_completed',
      description: 'Assessment completed',
      metadata: { 
        assessmentId: responseData.assessmentId,
        responseId: id,
        isComplete: responseData.isComplete
      }
    })
    
    return response
  }

  // Get response by ID
  async getById(id: string): Promise<AssessmentResponse | undefined> {
    const dbResponse = await db.assessmentResponses.get(id)
    return dbResponse ? fromDBAssessmentResponse(dbResponse) : undefined
  }

  // Get responses by assessment ID
  async getByAssessmentId(assessmentId: string): Promise<AssessmentResponse[]> {
    const dbResponses = await db.assessmentResponses
      .where('assessmentId')
      .equals(assessmentId)
      .sortBy('submittedAt')
    
    return dbResponses.map(fromDBAssessmentResponse)
  }

  // Get responses by candidate ID
  async getByCandidateId(candidateId: string): Promise<AssessmentResponse[]> {
    const dbResponses = await db.assessmentResponses
      .where('candidateId')
      .equals(candidateId)
      .sortBy('submittedAt')
    
    return dbResponses.map(fromDBAssessmentResponse)
  }

  // Get response by assessment and candidate
  async getByAssessmentAndCandidate(assessmentId: string, candidateId: string): Promise<AssessmentResponse | undefined> {
    const dbResponse = await db.assessmentResponses
      .where(['assessmentId', 'candidateId'])
      .equals([assessmentId, candidateId])
      .first()
    
    return dbResponse ? fromDBAssessmentResponse(dbResponse) : undefined
  }

  // Update response (for partial submissions)
  async update(id: string, updates: Partial<Omit<AssessmentResponse, 'id' | 'submittedAt'>>): Promise<AssessmentResponse> {
    const existing = await db.assessmentResponses.get(id)
    if (!existing) {
      throw new Error(`Assessment response with id ${id} not found`)
    }

    await db.assessmentResponses.update(id, updates)
    const updated = await db.assessmentResponses.get(id)
    return fromDBAssessmentResponse(updated!)
  }

  // Delete response
  async delete(id: string): Promise<void> {
    await db.assessmentResponses.delete(id)
  }

  // Get live query for reactive updates
  getLiveQuery(assessmentId?: string, candidateId?: string) {
    if (assessmentId && candidateId) {
      return liveQuery(() => this.getByAssessmentAndCandidate(assessmentId, candidateId))
    } else if (assessmentId) {
      return liveQuery(() => this.getByAssessmentId(assessmentId))
    } else if (candidateId) {
      return liveQuery(() => this.getByCandidateId(candidateId))
    }
    return liveQuery(() => Promise.resolve([]))
  }
}

// Database utilities
export class DatabaseUtils {
  // Clear all data (useful for testing)
  static async clearAll(): Promise<void> {
    await db.transaction('rw', [
      db.jobs,
      db.candidates,
      db.assessments,
      db.assessmentResponses,
      db.timelineEvents,
      db.candidateNotes
    ], async () => {
      await db.jobs.clear()
      await db.candidates.clear()
      await db.assessments.clear()
      await db.assessmentResponses.clear()
      await db.timelineEvents.clear()
      await db.candidateNotes.clear()
    })
  }

  // Get database statistics
  static async getStats(): Promise<{
    jobs: number
    candidates: number
    assessments: number
    responses: number
    timelineEvents: number
    notes: number
  }> {
    const [jobs, candidates, assessments, responses, timelineEvents, notes] = await Promise.all([
      db.jobs.count(),
      db.candidates.count(),
      db.assessments.count(),
      db.assessmentResponses.count(),
      db.timelineEvents.count(),
      db.candidateNotes.count()
    ])

    return {
      jobs,
      candidates,
      assessments,
      responses,
      timelineEvents,
      notes
    }
  }

  // Export data (for backup)
  static async exportData(): Promise<{
    jobs: Job[]
    candidates: Candidate[]
    assessments: Assessment[]
    responses: AssessmentResponse[]
    timelineEvents: TimelineEvent[]
    notes: CandidateNote[]
  }> {
    const [dbJobs, dbCandidates, dbAssessments, dbResponses, dbTimelineEvents, dbNotes] = await Promise.all([
      db.jobs.toArray(),
      db.candidates.toArray(),
      db.assessments.toArray(),
      db.assessmentResponses.toArray(),
      db.timelineEvents.toArray(),
      db.candidateNotes.toArray()
    ])

    // Convert candidates with their notes and timeline
    const candidates = await Promise.all(
      dbCandidates.map(async (dbCandidate) => {
        const candidate = fromDBCandidate(dbCandidate)
        const notes = await candidatesService.getNotes(dbCandidate.id)
        const timeline = await candidatesService.getTimeline(dbCandidate.id)
        
        return {
          ...candidate,
          notes,
          timeline
        }
      })
    )

    return {
      jobs: dbJobs.map(fromDBJob),
      candidates,
      assessments: dbAssessments.map(fromDBAssessment),
      responses: dbResponses.map(fromDBAssessmentResponse),
      timelineEvents: dbTimelineEvents.map(fromDBTimelineEvent),
      notes: dbNotes.map(fromDBCandidateNote)
    }
  }

  // Import data (for restore)
  static async importData(data: {
    jobs?: Job[]
    candidates?: Candidate[]
    assessments?: Assessment[]
    responses?: AssessmentResponse[]
    timelineEvents?: TimelineEvent[]
    notes?: CandidateNote[]
  }): Promise<void> {
    await db.transaction('rw', [
      db.jobs,
      db.candidates,
      db.assessments,
      db.assessmentResponses,
      db.timelineEvents,
      db.candidateNotes
    ], async () => {
      if (data.jobs) {
        await db.jobs.bulkAdd(data.jobs.map(toDBJob))
      }
      
      if (data.candidates) {
        const candidatesWithoutRelations = data.candidates.map(({ notes, timeline, ...candidate }) => candidate)
        await db.candidates.bulkAdd(candidatesWithoutRelations.map(toDBCandidate))
      }
      
      if (data.assessments) {
        await db.assessments.bulkAdd(data.assessments.map(toDBAssessment))
      }
      
      if (data.responses) {
        await db.assessmentResponses.bulkAdd(data.responses.map(toDBAssessmentResponse))
      }
      
      if (data.timelineEvents) {
        await db.timelineEvents.bulkAdd(data.timelineEvents.map(toDBTimelineEvent))
      }
      
      if (data.notes) {
        await db.candidateNotes.bulkAdd(data.notes.map(toDBCandidateNote))
      }
    })
  }
}

export const databaseUtils = new DatabaseUtils()

// Export service instances
export const jobsService = new JobsService()
export const candidatesService = new CandidatesService()
export const assessmentsService = new AssessmentsService()
export const assessmentResponsesService = new AssessmentResponsesService()