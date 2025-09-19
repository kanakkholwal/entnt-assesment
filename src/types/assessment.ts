export type QuestionType = 
  | 'single-choice' 
  | 'multi-choice' 
  | 'short-text' 
  | 'long-text' 
  | 'numeric' 
  | 'file-upload'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  patternMessage?: string
  fileTypes?: string[]
  maxFileSize?: number // in MB
  minFileSize?: number // in MB
  customMessage?: string
}

export interface ConditionalRule {
  dependsOn: string // Question ID
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'is_empty' | 'is_not_empty'
  value?: any
  action: 'show' | 'hide' | 'require' | 'disable'
}

export interface ValidationError {
  field: string
  message: string
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'fileType' | 'fileSize' | 'custom'
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: string[]
  validation?: ValidationRule
  conditionalLogic?: ConditionalRule
  order: number
}

export interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  order: number
}

export interface Assessment {
  id: string
  jobId: string
  title: string
  sections: AssessmentSection[]
  createdAt: Date
  updatedAt: Date
}

export interface AssessmentResponse {
  id: string
  assessmentId: string
  candidateId: string
  responses: Record<string, any> // Question ID -> Answer
  submittedAt: Date
  completedSections: string[]
  isComplete: boolean
}

export interface CreateAssessmentRequest {
  jobId: string
  title: string
  description?: string
  sections?: Omit<AssessmentSection, 'id'>[]
}

export interface UpdateAssessmentRequest {
  title?: string
  description?: string
  sections?: AssessmentSection[]
}

export interface AssessmentFilters {
  jobId?: string
  search?: string
  sortBy?: 'title' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetAssessmentsParams {
  page?: number
  limit?: number
  filters?: AssessmentFilters
}

export interface SubmitAssessmentRequest {
  assessmentId: string
  candidateId: string
  responses: Record<string, any>
  completedSections: string[]
}

export interface AssessmentPreviewData {
  assessment: Assessment
  responses?: Record<string, any>
  currentSection?: number
}