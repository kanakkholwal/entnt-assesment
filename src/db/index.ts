import Dexie, { type EntityTable } from 'dexie'
import type {
  Job,
  Candidate,
  Assessment,
  AssessmentResponse,
  TimelineEvent,
  CandidateNote
} from '../types'

// Database schema interfaces for Dexie
export interface DBJob extends Omit<Job, 'createdAt' | 'updatedAt'> {
  createdAt: number
  updatedAt: number
}

export interface DBCandidate extends Omit<Candidate, 'appliedAt' | 'notes' | 'timeline'> {
  appliedAt: number
}

export interface DBAssessment extends Omit<Assessment, 'createdAt' | 'updatedAt'> {
  createdAt: number
  updatedAt: number
}

export interface DBAssessmentResponse extends Omit<AssessmentResponse, 'submittedAt'> {
  submittedAt: number
}

export interface DBTimelineEvent extends Omit<TimelineEvent, 'createdAt'> {
  createdAt: number
}

export interface DBCandidateNote extends Omit<CandidateNote, 'createdAt'> {
  createdAt: number
}

// Main database class
export class TalentFlowDB extends Dexie {
  // Define tables with proper typing
  jobs!: EntityTable<DBJob, 'id'>
  candidates!: EntityTable<DBCandidate, 'id'>
  assessments!: EntityTable<DBAssessment, 'id'>
  assessmentResponses!: EntityTable<DBAssessmentResponse, 'id'>
  timelineEvents!: EntityTable<DBTimelineEvent, 'id'>
  candidateNotes!: EntityTable<DBCandidateNote, 'id'>

  constructor() {
    super('TalentFlowDB')
    
    // Define schema with proper indexing for performance
    this.version(1).stores({
      // Jobs table with indexes for common queries
      jobs: '++id, title, status, order, slug, createdAt, updatedAt, *tags',
      
      // Candidates table with indexes for filtering and searching
      candidates: '++id, name, email, stage, jobId, appliedAt',
      
      // Assessments table with job relationship index
      assessments: '++id, jobId, title, createdAt, updatedAt',
      
      // Assessment responses with candidate and assessment indexes
      assessmentResponses: '++id, assessmentId, candidateId, submittedAt, isComplete',
      
      // Timeline events with candidate relationship and chronological index
      timelineEvents: '++id, candidateId, type, createdAt, createdBy',
      
      // Candidate notes with candidate relationship and chronological index
      candidateNotes: '++id, candidateId, authorId, createdAt, *mentions'
    })

    // Add hooks for data transformation
    this.jobs.hook('creating', (_primKey, obj, _trans) => {
      const now = Date.now()
      obj.createdAt = now
      obj.updatedAt = now
    })

    this.jobs.hook('updating', (modifications, _primKey, _obj, _trans) => {
      ;(modifications as any).updatedAt = Date.now()
    })

    this.assessments.hook('creating', (_primKey, obj, _trans) => {
      const now = Date.now()
      obj.createdAt = now
      obj.updatedAt = now
    })

    this.assessments.hook('updating', (modifications, _primKey, _obj, _trans) => {
      ;(modifications as any).updatedAt = Date.now()
    })

    this.candidates.hook('creating', (_primKey, obj, _trans) => {
      obj.appliedAt = obj.appliedAt || Date.now()
    })

    this.timelineEvents.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = obj.createdAt || Date.now()
    })

    this.candidateNotes.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = obj.createdAt || Date.now()
    })

    this.assessmentResponses.hook('creating', (_primKey, obj, _trans) => {
      obj.submittedAt = obj.submittedAt || Date.now()
    })
  }
}

// Create and export database instance
export const db = new TalentFlowDB()

// Helper functions for date conversion
export const toDBDate = (date: Date): number => date.getTime()
export const fromDBDate = (timestamp: number): Date => new Date(timestamp)

// Type conversion helpers
export const toDBJob = (job: Job): DBJob => ({
  ...job,
  createdAt: toDBDate(job.createdAt),
  updatedAt: toDBDate(job.updatedAt)
})

export const fromDBJob = (dbJob: DBJob): Job => ({
  ...dbJob,
  createdAt: fromDBDate(dbJob.createdAt),
  updatedAt: fromDBDate(dbJob.updatedAt)
})

export const toDBCandidate = (candidate: Omit<Candidate, 'notes' | 'timeline'>): DBCandidate => ({
  ...candidate,
  appliedAt: toDBDate(candidate.appliedAt)
})

export const fromDBCandidate = (dbCandidate: DBCandidate): Omit<Candidate, 'notes' | 'timeline'> => ({
  ...dbCandidate,
  appliedAt: fromDBDate(dbCandidate.appliedAt)
})

export const toDBAssessment = (assessment: Assessment): DBAssessment => ({
  ...assessment,
  createdAt: toDBDate(assessment.createdAt),
  updatedAt: toDBDate(assessment.updatedAt)
})

export const fromDBAssessment = (dbAssessment: DBAssessment): Assessment => ({
  ...dbAssessment,
  createdAt: fromDBDate(dbAssessment.createdAt),
  updatedAt: fromDBDate(dbAssessment.updatedAt)
})

export const toDBAssessmentResponse = (response: AssessmentResponse): DBAssessmentResponse => ({
  ...response,
  submittedAt: toDBDate(response.submittedAt)
})

export const fromDBAssessmentResponse = (dbResponse: DBAssessmentResponse): AssessmentResponse => ({
  ...dbResponse,
  submittedAt: fromDBDate(dbResponse.submittedAt)
})

export const toDBTimelineEvent = (event: TimelineEvent): DBTimelineEvent => ({
  ...event,
  createdAt: toDBDate(event.createdAt)
})

export const fromDBTimelineEvent = (dbEvent: DBTimelineEvent): TimelineEvent => ({
  ...dbEvent,
  createdAt: fromDBDate(dbEvent.createdAt)
})

export const toDBCandidateNote = (note: CandidateNote): DBCandidateNote => ({
  ...note,
  createdAt: toDBDate(note.createdAt)
})

export const fromDBCandidateNote = (dbNote: DBCandidateNote): CandidateNote => ({
  ...dbNote,
  createdAt: fromDBDate(dbNote.createdAt)
})

// Don't re-export services here to avoid circular dependencies
// Services should import db directly from this file