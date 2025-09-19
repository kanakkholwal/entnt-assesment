import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useJobsStore } from '../stores/jobs'
import { useCandidatesStore } from '../stores/candidates'
import { useAssessmentsStore } from '../stores/assessments'
import { useUIStore } from '../stores/ui'

// Mock the API service
vi.mock('../services/api', () => ({
  apiService: {
    getJobs: vi.fn(),
    createJob: vi.fn(),
    updateJob: vi.fn(),
    reorderJob: vi.fn(),
    getCandidates: vi.fn(),
    updateCandidate: vi.fn(),
    addCandidateNote: vi.fn(),
    getAssessment: vi.fn(),
    updateAssessment: vi.fn(),
    submitAssessmentResponse: vi.fn()
  },
  APIError: class APIError extends Error {
    constructor(message: string, public status: number, public code?: string, public retryable: boolean = false) {
      super(message)
      this.name = 'APIError'
    }
  }
}))

describe('Zustand Stores', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useJobsStore.setState({
      jobs: [],
      loading: false,
      error: null,
      filters: { search: '', status: undefined, tags: [] },
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    useCandidatesStore.setState({
      candidates: [],
      selectedCandidate: null,
      loading: false,
      error: null,
      filters: { search: '', stage: undefined, jobId: undefined },
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
    })

    useAssessmentsStore.setState({
      assessments: {},
      responses: {},
      currentAssessment: null,
      loading: false,
      error: null
    })

    useUIStore.setState({
      sidebarOpen: true,
      theme: 'light',
      notifications: []
    })
  })

  describe('JobsStore', () => {
    it('should have initial state', () => {
      const state = useJobsStore.getState()
      
      expect(state.jobs).toEqual([])
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.filters).toEqual({ search: '', status: undefined, tags: [] })
      expect(state.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 })
    })

    it('should update filters', () => {
      const { setFilters } = useJobsStore.getState()
      
      setFilters({ search: 'developer' })
      
      const state = useJobsStore.getState()
      expect(state.filters.search).toBe('developer')
      expect(state.pagination.page).toBe(1) // Should reset to page 1
    })

    it('should update pagination', () => {
      const { setPagination } = useJobsStore.getState()
      
      setPagination({ page: 2, limit: 20 })
      
      const state = useJobsStore.getState()
      expect(state.pagination.page).toBe(2)
      expect(state.pagination.limit).toBe(20)
    })
  })

  describe('CandidatesStore', () => {
    it('should have initial state', () => {
      const state = useCandidatesStore.getState()
      
      expect(state.candidates).toEqual([])
      expect(state.selectedCandidate).toBe(null)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.filters).toEqual({ search: '', stage: undefined, jobId: undefined })
    })

    it('should select candidate', () => {
      const { selectCandidate } = useCandidatesStore.getState()
      const mockCandidate = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        stage: 'applied' as const,
        jobId: 'job-1',
        appliedAt: new Date(),
        notes: [],
        timeline: []
      }
      
      selectCandidate(mockCandidate)
      
      const state = useCandidatesStore.getState()
      expect(state.selectedCandidate).toEqual(mockCandidate)
    })

    it('should update filters', () => {
      const { setFilters } = useCandidatesStore.getState()
      
      setFilters({ stage: 'screen' })
      
      const state = useCandidatesStore.getState()
      expect(state.filters.stage).toBe('screen')
    })
  })

  describe('AssessmentsStore', () => {
    it('should have initial state', () => {
      const state = useAssessmentsStore.getState()
      
      expect(state.assessments).toEqual({})
      expect(state.responses).toEqual({})
      expect(state.currentAssessment).toBe(null)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should set current assessment', () => {
      const { setCurrentAssessment } = useAssessmentsStore.getState()
      const mockAssessment = {
        id: 'assessment-1',
        jobId: 'job-1',
        title: 'Technical Assessment',
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setCurrentAssessment(mockAssessment)
      
      const state = useAssessmentsStore.getState()
      expect(state.currentAssessment).toEqual(mockAssessment)
    })
  })

  describe('UIStore', () => {
    it('should have initial state', () => {
      const state = useUIStore.getState()
      
      expect(state.sidebarOpen).toBe(true)
      expect(state.theme).toBe('light')
      expect(state.notifications).toEqual([])
    })

    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState()
      
      toggleSidebar()
      
      let state = useUIStore.getState()
      expect(state.sidebarOpen).toBe(false)
      
      toggleSidebar()
      
      state = useUIStore.getState()
      expect(state.sidebarOpen).toBe(true)
    })

    it('should set theme', () => {
      const { setTheme } = useUIStore.getState()
      
      setTheme('dark')
      
      const state = useUIStore.getState()
      expect(state.theme).toBe('dark')
    })

    it('should add notification', () => {
      const { addNotification } = useUIStore.getState()
      
      addNotification({
        type: 'success',
        title: 'Test Notification',
        message: 'This is a test'
      })
      
      const state = useUIStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0].type).toBe('success')
      expect(state.notifications[0].title).toBe('Test Notification')
      expect(state.notifications[0].message).toBe('This is a test')
      expect(state.notifications[0].id).toBeDefined()
      expect(state.notifications[0].createdAt).toBeInstanceOf(Date)
    })

    it('should remove notification', () => {
      const { addNotification, removeNotification } = useUIStore.getState()
      
      addNotification({
        type: 'info',
        title: 'Test Notification'
      })
      
      let state = useUIStore.getState()
      const notificationId = state.notifications[0].id
      
      removeNotification(notificationId)
      
      state = useUIStore.getState()
      expect(state.notifications).toHaveLength(0)
    })
  })
})