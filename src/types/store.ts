// Store-related types for Zustand state management

import type { Job, JobFilters, CreateJobRequest } from './job'
import type { Candidate, CandidateFilters, CandidateStage } from './candidate'
import type { Assessment, AssessmentResponse } from './assessment'
import type { PaginationState, LoadingState } from './common'

// Jobs Store Types
export interface JobsStore extends LoadingState {
  jobs: Job[]
  filters: JobFilters
  pagination: PaginationState
  
  // Actions
  fetchJobs: () => Promise<void>
  createJob: (job: CreateJobRequest) => Promise<void>
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>
  reorderJobs: (fromOrder: number, toOrder: number) => Promise<void>
  setFilters: (filters: Partial<JobFilters>) => void
  setPagination: (pagination: Partial<PaginationState>) => void
}

// Candidates Store Types
export interface CandidatesStore extends LoadingState {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  filters: CandidateFilters
  pagination: PaginationState
  
  // Actions
  fetchCandidates: (filters?: CandidateFilters) => Promise<void>
  selectCandidate: (candidate: Candidate | null) => void
  updateCandidateStage: (id: string, stage: CandidateStage) => Promise<void>
  addCandidateNote: (id: string, note: string) => Promise<void>
  setFilters: (filters: Partial<CandidateFilters>) => void
}

// Assessments Store Types
export interface AssessmentsStore extends LoadingState {
  assessments: Record<string, Assessment>
  responses: Record<string, AssessmentResponse>
  currentAssessment: Assessment | null
  
  // Actions
  fetchAssessment: (jobId: string) => Promise<void>
  updateAssessment: (jobId: string, assessment: Assessment) => Promise<void>
  submitResponse: (assessmentId: string, response: AssessmentResponse) => Promise<void>
  setCurrentAssessment: (assessment: Assessment | null) => void
}

// UI Store Types
export interface UIStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  
  // Actions
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  createdAt: Date
}