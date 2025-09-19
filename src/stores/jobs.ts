import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiService, APIError } from '../services/api'
import type { JobsStore } from '../types/store'
import type { Job, CreateJobRequest, JobFilters } from '../types/job'
import type { PaginationState } from '../types/common'

// Initial state
const initialState = {
  jobs: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    status: undefined,
    tags: []
  } as JobFilters,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  } as PaginationState
}

export const useJobsStore = create<JobsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch jobs with current filters and pagination
      fetchJobs: async () => {
        const { filters, pagination } = get()
        
        set({ loading: true, error: null })
        
        try {
          const response = await apiService.getJobs({
            page: pagination.page,
            limit: pagination.limit,
            filters
          })
          
          set({
            jobs: response.data,
            pagination: response.pagination,
            loading: false
          })
        } catch (error) {
          const apiError = error as APIError
          set({
            loading: false,
            error: apiError.message || 'Failed to fetch jobs'
          })
          throw error
        }
      },

      // Create new job with optimistic update
      createJob: async (jobData: CreateJobRequest) => {
        const currentJobs = get().jobs
        
        // Create optimistic job
        const optimisticJob: Job = {
          id: `temp-${Date.now()}`,
          ...jobData,
          slug: jobData.title.toLowerCase().replace(/\s+/g, '-'),
          status: 'active',
          tags: jobData.tags || [],
          order: currentJobs.length,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // Optimistic update
        set(state => ({
          jobs: [...state.jobs, optimisticJob],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1
          }
        }))
        
        try {
          const newJob = await apiService.createJob(jobData)
          
          // Replace optimistic job with real job
          set(state => ({
            jobs: state.jobs.map(job => 
              job.id === optimisticJob.id ? newJob : job
            )
          }))
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            jobs: state.jobs.filter(job => job.id !== optimisticJob.id),
            pagination: {
              ...state.pagination,
              total: state.pagination.total - 1
            },
            error: (error as APIError).message || 'Failed to create job'
          }))
          throw error
        }
      },

      // Update job with optimistic update
      updateJob: async (id: string, updates: Partial<Job>) => {
        const currentJobs = get().jobs
        const jobIndex = currentJobs.findIndex(job => job.id === id)
        
        if (jobIndex === -1) {
          throw new Error('Job not found')
        }
        
        const originalJob = currentJobs[jobIndex]
        const optimisticJob = {
          ...originalJob,
          ...updates,
          updatedAt: new Date()
        }
        
        // Optimistic update
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === id ? optimisticJob : job
          )
        }))
        
        try {
          const updatedJob = await apiService.updateJob(id, updates)
          
          // Replace optimistic job with real job
          set(state => ({
            jobs: state.jobs.map(job => 
              job.id === id ? updatedJob : job
            )
          }))
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            jobs: state.jobs.map(job => 
              job.id === id ? originalJob : job
            ),
            error: (error as APIError).message || 'Failed to update job'
          }))
          throw error
        }
      },

      // Reorder jobs with optimistic update
      reorderJobs: async (fromOrder: number, toOrder: number) => {
        const currentJobs = [...get().jobs]
        const jobToMove = currentJobs.find(job => job.order === fromOrder)
        
        if (!jobToMove) {
          throw new Error('Job not found')
        }
        
        // Calculate new order for optimistic update
        const optimisticJobs = currentJobs.map(job => {
          if (job.order === fromOrder) {
            return { ...job, order: toOrder }
          }
          if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
            return { ...job, order: job.order - 1 }
          }
          if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) {
            return { ...job, order: job.order + 1 }
          }
          return job
        }).sort((a, b) => a.order - b.order)
        
        // Optimistic update
        set({ jobs: optimisticJobs })
        
        try {
          await apiService.reorderJob(jobToMove.id, fromOrder, toOrder)
          
          // Refresh jobs to get server state
          await get().fetchJobs()
        } catch (error) {
          // Rollback optimistic update
          set({ 
            jobs: currentJobs,
            error: (error as APIError).message || 'Failed to reorder jobs'
          })
          throw error
        }
      },

      // Set filters and trigger fetch
      setFilters: (newFilters: Partial<JobFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 } // Reset to first page
        }))
        
        // Trigger fetch with new filters
        get().fetchJobs()
      },

      // Set pagination
      setPagination: (newPagination: Partial<PaginationState>) => {
        set(state => ({
          pagination: { ...state.pagination, ...newPagination }
        }))
        
        // Trigger fetch with new pagination
        get().fetchJobs()
      }
    }),
    {
      name: 'jobs-store',
      partialize: (state: JobsStore) => ({
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
)