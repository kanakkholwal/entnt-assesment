import { useCallback } from 'react'
import { useJobsStore } from '../stores/jobs'
import { useUIStore } from '../stores/ui'
import type { Job, CreateJobRequest } from '../types/job'

// Custom hook for jobs management
export const useJobs = () => {
  const {
    jobs,
    loading,
    error,
    filters,
    pagination,
    fetchJobs,
    createJob,
    updateJob,
    reorderJobs,
    setFilters,
    setPagination
  } = useJobsStore()

  const addNotification = useUIStore(state => state.addNotification)

  // Enhanced create job with notification
  const createJobWithNotification = useCallback(async (jobData: CreateJobRequest) => {
    try {
      await createJob(jobData)
      addNotification({
        type: 'success',
        title: 'Job Created',
        message: `"${jobData.title}" has been created successfully`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Job',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [createJob, addNotification])

  // Enhanced update job with notification
  const updateJobWithNotification = useCallback(async (id: string, updates: Partial<Job>) => {
    try {
      await updateJob(id, updates)
      addNotification({
        type: 'success',
        title: 'Job Updated',
        message: 'Job has been updated successfully'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Job',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [updateJob, addNotification])

  // Enhanced reorder jobs with notification
  const reorderJobsWithNotification = useCallback(async (fromOrder: number, toOrder: number) => {
    try {
      await reorderJobs(fromOrder, toOrder)
      addNotification({
        type: 'success',
        title: 'Jobs Reordered',
        message: 'Job order has been updated successfully'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Reorder Jobs',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [reorderJobs, addNotification])

  // Search jobs
  const searchJobs = useCallback((query: string) => {
    setFilters({ search: query })
  }, [setFilters])

  // Filter by status
  const filterByStatus = useCallback((status: 'active' | 'archived' | undefined) => {
    setFilters({ status })
  }, [setFilters])

  // Filter by tags
  const filterByTags = useCallback((tags: string[]) => {
    setFilters({ tags })
  }, [setFilters])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: undefined,
      tags: []
    })
  }, [setFilters])

  // Go to page
  const goToPage = useCallback((page: number) => {
    setPagination({ page })
  }, [setPagination])

  // Change page size
  const changePageSize = useCallback((limit: number) => {
    setPagination({ limit, page: 1 })
  }, [setPagination])

  // Get job by id
  const getJobById = useCallback((id: string): Job | undefined => {
    return jobs.find(job => job.id === id)
  }, [jobs])

  // Get active jobs
  const getActiveJobs = useCallback((): Job[] => {
    return jobs.filter(job => job.status === 'active')
  }, [jobs])

  // Get archived jobs
  const getArchivedJobs = useCallback((): Job[] => {
    return jobs.filter(job => job.status === 'archived')
  }, [jobs])

  return {
    // State
    jobs,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    fetchJobs,
    createJob: createJobWithNotification,
    updateJob: updateJobWithNotification,
    reorderJobs: reorderJobsWithNotification,
    
    // Filter actions
    searchJobs,
    filterByStatus,
    filterByTags,
    clearFilters,
    
    // Pagination actions
    goToPage,
    changePageSize,
    
    // Utility functions
    getJobById,
    getActiveJobs,
    getArchivedJobs
  }
}