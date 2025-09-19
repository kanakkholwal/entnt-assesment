import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { APIError, apiService } from '../services/api'
import type { Candidate, CandidateFilters, CandidateStage } from '../types/candidate'
import type { PaginationState } from '../types/common'
import type { CandidatesStore } from '../types/store'

// Initial state
const initialState = {
  candidates: [],
  selectedCandidate: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    stage: undefined,
    jobId: undefined
  } as CandidateFilters,
  pagination: {
    page: 1,
    limit: 100, // Higher limit for virtualized list to support 1000+ candidates efficiently
    total: 0,
    totalPages: 0
  } as PaginationState
}

export const useCandidatesStore = create<CandidatesStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch candidates with current filters and pagination
      fetchCandidates: async (customFilters?: CandidateFilters) => {
        const { filters, pagination } = get()
        const activeFilters = customFilters || filters

        set({ loading: true, error: null })

        try {
          const response = await apiService.getCandidates({
            page: pagination.page,
            limit: pagination.limit,
            filters: activeFilters
          })

          set({
            candidates: response.data,
            pagination: response.pagination,
            loading: false,
            ...(customFilters && { filters: customFilters })
          })
        } catch (error) {
          const apiError = error as APIError
          set({
            loading: false,
            error: apiError.message || 'Failed to fetch candidates'
          })
          throw error
        }
      },

      // Select a candidate
      selectCandidate: (candidate: Candidate | null) => {
        set({ selectedCandidate: candidate })
      },
      getCandidateById: async (candidateId: string) => {
        // First check if candidate is already in the store
        const currentCandidates = get().candidates
        const existingCandidate = currentCandidates.find(c => c.id === candidateId)
        if (existingCandidate) {
          set({ selectedCandidate: existingCandidate })
          return existingCandidate
        }

        // If not found, try to fetch from API
        try {
          const candidate = await apiService.getCandidate(candidateId)
          if (candidate) {
            set({ selectedCandidate: candidate })
            return candidate
          }
        } catch (error) {
          console.error('Failed to fetch candidate:', error)
        }
        
        return null
      },

      // Update candidate stage with optimistic update
      updateCandidateStage: async (id: string, stage: CandidateStage) => {
        const currentCandidates = get().candidates
        const candidateIndex = currentCandidates.findIndex(c => c.id === id)

        if (candidateIndex === -1) {
          throw new Error('Candidate not found')
        }

        const originalCandidate = currentCandidates[candidateIndex]
        const optimisticCandidate = {
          ...originalCandidate,
          stage,
          updatedAt: new Date()
        }

        // Optimistic update
        set(state => ({
          candidates: state.candidates.map(candidate =>
            candidate.id === id ? optimisticCandidate : candidate
          ),
          selectedCandidate: state.selectedCandidate?.id === id
            ? optimisticCandidate
            : state.selectedCandidate
        }))

        try {
          const updatedCandidate = await apiService.updateCandidate(id, { stage })

          // Replace optimistic candidate with real candidate
          set(state => ({
            candidates: state.candidates.map(candidate =>
              candidate.id === id ? updatedCandidate : candidate
            ),
            selectedCandidate: state.selectedCandidate?.id === id
              ? updatedCandidate
              : state.selectedCandidate
          }))
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            candidates: state.candidates.map(candidate =>
              candidate.id === id ? originalCandidate : candidate
            ),
            selectedCandidate: state.selectedCandidate?.id === id
              ? originalCandidate
              : state.selectedCandidate,
            error: (error as APIError).message || 'Failed to update candidate stage'
          }))
          throw error
        }
      },

      // Add candidate note with optimistic update
      addCandidateNote: async (id: string, note: string) => {
        const currentCandidates = get().candidates
        const candidateIndex = currentCandidates.findIndex(c => c.id === id)

        if (candidateIndex === -1) {
          throw new Error('Candidate not found')
        }

        const originalCandidate = currentCandidates[candidateIndex]

        // Create optimistic note
        const optimisticNote = {
          id: `temp-${Date.now()}`,
          candidateId: id,
          content: note,
          mentions: [], // TODO: Parse mentions from note content
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 'current-user', // TODO: Get from auth context
          authorName: 'Current User'
        }

        const optimisticCandidate = {
          ...originalCandidate,
          notes: [...(originalCandidate.notes || []), optimisticNote],
          updatedAt: new Date()
        }

        // Optimistic update
        set(state => ({
          candidates: state.candidates.map(candidate =>
            candidate.id === id ? optimisticCandidate : candidate
          ),
          selectedCandidate: state.selectedCandidate?.id === id
            ? optimisticCandidate
            : state.selectedCandidate
        }))

        try {
          const newNote = await apiService.addCandidateNote({
            candidateId: id,
            content: note,
            mentions: [] // TODO: Parse mentions
          })

          // Replace optimistic note with real note
          set(state => ({
            candidates: state.candidates.map(candidate => {
              if (candidate.id === id) {
                return {
                  ...candidate,
                  notes: candidate.notes?.map(n =>
                    n.id === optimisticNote.id ? newNote : n
                  ) || [newNote]
                }
              }
              return candidate
            }),
            selectedCandidate: state.selectedCandidate?.id === id
              ? {
                ...state.selectedCandidate,
                notes: state.selectedCandidate.notes?.map(n =>
                  n.id === optimisticNote.id ? newNote : n
                ) || [newNote]
              }
              : state.selectedCandidate
          }))
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            candidates: state.candidates.map(candidate =>
              candidate.id === id ? originalCandidate : candidate
            ),
            selectedCandidate: state.selectedCandidate?.id === id
              ? originalCandidate
              : state.selectedCandidate,
            error: (error as APIError).message || 'Failed to add candidate note'
          }))
          throw error
        }
      },

      // Set filters and trigger fetch
      setFilters: (newFilters: Partial<CandidateFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 } // Reset to first page
        }))

        // Trigger fetch with new filters
        get().fetchCandidates()
      }
    }),
    {
      name: 'candidates-store',
      partialize: (state: CandidatesStore) => ({
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
)