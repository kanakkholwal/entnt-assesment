export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'

export interface Candidate {
  id: string
  name: string
  email: string
  stage: CandidateStage
  jobId: string
  appliedAt: Date
  notes: CandidateNote[]
  timeline: TimelineEvent[]
}

export interface CandidateNote {
  id: string
  candidateId: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  mentions?: string[] // Array of mentioned user IDs or names
}

export interface TimelineEvent {
  id: string
  candidateId: string
  type: 'stage_change' | 'note_added' | 'assessment_completed' | 'interview_scheduled'
  description: string
  metadata?: Record<string, any>
  createdAt: Date
  createdBy?: string
}

export interface CandidateFilters {
  search?: string
  stage?: CandidateStage | 'all'
  jobId?: string
  sortBy?: 'name' | 'appliedAt' | 'stage'
  sortOrder?: 'asc' | 'desc'
}

export interface GetCandidatesParams {
  page?: number
  limit?: number
  filters?: CandidateFilters
}

export interface UpdateCandidateRequest {
  name?: string
  email?: string
  stage?: CandidateStage
  jobId?: string
}

export interface CreateCandidateRequest {
  name: string
  email: string
  jobId: string
  stage?: CandidateStage
}

export interface AddCandidateNoteRequest {
  candidateId: string
  content: string
  mentions?: string[]
}