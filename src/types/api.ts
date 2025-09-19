// API-specific types for mock service worker and database operations

import type { Job, CreateJobRequest, UpdateJobRequest, GetJobsParams } from './job'
import type { Candidate, CreateCandidateRequest, UpdateCandidateRequest, GetCandidatesParams } from './candidate'
import type { Assessment, CreateAssessmentRequest, UpdateAssessmentRequest, GetAssessmentsParams, AssessmentResponse } from './assessment'
import type { PaginatedResponse } from './common'

// API Service Interface
export interface APIService {
  // Jobs
  getJobs(params: GetJobsParams): Promise<PaginatedResponse<Job>>
  getJob(id: string): Promise<Job>
  createJob(job: CreateJobRequest): Promise<Job>
  updateJob(id: string, updates: UpdateJobRequest): Promise<Job>
  deleteJob(id: string): Promise<void>
  reorderJob(id: string, fromOrder: number, toOrder: number): Promise<void>
  
  // Candidates
  getCandidates(params: GetCandidatesParams): Promise<PaginatedResponse<Candidate>>
  getCandidate(id: string): Promise<Candidate>
  createCandidate(candidate: CreateCandidateRequest): Promise<Candidate>
  updateCandidate(id: string, updates: UpdateCandidateRequest): Promise<Candidate>
  deleteCandidate(id: string): Promise<void>
  
  // Assessments
  getAssessments(params: GetAssessmentsParams): Promise<PaginatedResponse<Assessment>>
  getAssessment(jobId: string): Promise<Assessment>
  createAssessment(assessment: CreateAssessmentRequest): Promise<Assessment>
  updateAssessment(jobId: string, assessment: UpdateAssessmentRequest): Promise<Assessment>
  deleteAssessment(id: string): Promise<void>
  submitAssessmentResponse(response: AssessmentResponse): Promise<void>
}

// Database operation types
export interface DatabaseOperation<T> {
  type: 'create' | 'read' | 'update' | 'delete'
  table: string
  data?: T
  id?: string
  filters?: Record<string, any>
}

// Mock API configuration
export interface MockAPIConfig {
  baseDelay: number
  maxDelay: number
  errorRate: number
  enableLogging: boolean
}

// Seed data configuration
export interface SeedDataConfig {
  jobsCount: number
  candidatesCount: number
  assessmentsPerJob: number
  questionsPerAssessment: number
}