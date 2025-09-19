// Application constants
export const APPLICATION_STATUSES = [
  'applied',
  'screening', 
  'interview',
  'offer',
  'hired',
  'rejected'
] as const

export const JOB_TYPES = [
  'full-time',
  'part-time', 
  'contract',
  'internship'
] as const

export const USER_ROLES = [
  'admin',
  'recruiter',
  'hiring_manager'
] as const

export const ENTITY_STATUSES = [
  'active',
  'inactive',
  'pending',
  'archived'
] as const

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100
} as const