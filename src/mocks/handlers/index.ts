import { jobHandlers } from './jobs'
import { candidateHandlers } from './candidates'
import { assessmentHandlers } from './assessments'

// Combine all API handlers
export const handlers = [
  ...jobHandlers,
  ...candidateHandlers,
  ...assessmentHandlers
]