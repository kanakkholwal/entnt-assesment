export interface Job {
  id: string
  title: string
  slug: string
  status: 'active' | 'archived'
  tags: string[]
  order: number
  description?: string
  requirements?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobRequest {
  title: string
  slug?: string
  description?: string
  requirements?: string[]
  tags?: string[]
}

export interface UpdateJobRequest {
  title?: string
  slug?: string
  description?: string
  requirements?: string[]
  tags?: string[]
  status?: 'active' | 'archived'
}

export interface JobFilters {
  search?: string
  status?: 'active' | 'archived' | 'all'
  tags?: string[]
  sortBy?: 'title' | 'createdAt' | 'order'
  sortOrder?: 'asc' | 'desc'
}

export interface GetJobsParams {
  page?: number
  limit?: number
  filters?: JobFilters
}

export interface ReorderJobRequest {
  id: string
  fromOrder: number
  toOrder: number
}