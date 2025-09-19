// Common types used across the application

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationState
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
  retryable: boolean
}

export interface LoadingState {
  loading: boolean
  error: string | null
}

// Base filter interface that other filters can extend
export interface BaseFilters {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Generic API request parameters
export interface BaseApiParams {
  page?: number
  limit?: number
}

// Drag and drop types
export interface DragDropResult {
  fromIndex: number
  toIndex: number
  fromOrder: number
  toOrder: number
}

// Search and filter types
export interface SearchParams {
  query: string
  debounceMs?: number
}

// File upload types
export interface FileUpload {
  file: File
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
}

// Form handling types
export interface FormField<T = any> {
  name: string
  value: T
  error?: string
  touched: boolean
  required: boolean
}

export interface FormState<T = Record<string, any>> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isValid: boolean
  isSubmitting: boolean
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export type Validator<T> = (value: T) => ValidationResult

// Generic CRUD operations
export interface CRUDOperations<T, CreateT = Omit<T, 'id' | 'createdAt' | 'updatedAt'>, UpdateT = Partial<CreateT>> {
  create: (data: CreateT) => Promise<T>
  read: (id: string) => Promise<T>
  update: (id: string, data: UpdateT) => Promise<T>
  delete: (id: string) => Promise<void>
  list: (params?: BaseApiParams) => Promise<PaginatedResponse<T>>
}