import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiService, APIError } from '../services/api'
import type { AssessmentsStore } from '../types/store'
import type { Assessment, AssessmentResponse } from '../types/assessment'

// Initial state
const initialState = {
  assessments: {},
  responses: {},
  currentAssessment: null,
  loading: false,
  error: null
}

export const useAssessmentsStore = create<AssessmentsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch assessment for a specific job
      fetchAssessment: async (jobId: string) => {
        set({ loading: true, error: null })
        
        try {
          const assessment = await apiService.getAssessment(jobId)
          
          set(state => ({
            assessments: {
              ...state.assessments,
              [jobId]: assessment
            },
            loading: false
          }))
        } catch (error) {
          const apiError = error as APIError
          set({
            loading: false,
            error: apiError.message || 'Failed to fetch assessment'
          })
          throw error
        }
      },

      // Update assessment with optimistic update
      updateAssessment: async (jobId: string, assessment: Assessment) => {
        const currentAssessments = get().assessments
        const originalAssessment = currentAssessments[jobId]
        
        // Create optimistic assessment
        const optimisticAssessment = {
          ...assessment,
          updatedAt: new Date()
        }
        
        // Optimistic update
        set(state => ({
          assessments: {
            ...state.assessments,
            [jobId]: optimisticAssessment
          },
          currentAssessment: state.currentAssessment?.id === assessment.id 
            ? optimisticAssessment 
            : state.currentAssessment
        }))
        
        try {
          const updatedAssessment = await apiService.updateAssessment(jobId, assessment)
          
          // Replace optimistic assessment with real assessment
          set(state => ({
            assessments: {
              ...state.assessments,
              [jobId]: updatedAssessment
            },
            currentAssessment: state.currentAssessment?.id === assessment.id 
              ? updatedAssessment 
              : state.currentAssessment
          }))
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            assessments: {
              ...state.assessments,
              [jobId]: originalAssessment
            },
            currentAssessment: state.currentAssessment?.id === assessment.id 
              ? originalAssessment 
              : state.currentAssessment,
            error: (error as APIError).message || 'Failed to update assessment'
          }))
          throw error
        }
      },

      // Submit assessment response with optimistic update
      submitResponse: async (assessmentId: string, response: AssessmentResponse) => {
        const currentResponses = get().responses
        const responseKey = `${assessmentId}-${response.candidateId}`
        
        // Create optimistic response
        const optimisticResponse = {
          ...response,
          submittedAt: new Date()
        }
        
        // Optimistic update
        set(state => ({
          responses: {
            ...state.responses,
            [responseKey]: optimisticResponse
          }
        }))
        
        try {
          await apiService.submitAssessmentResponse(response)
          
          // Response is already optimistically updated, no need to replace
          // unless we need server-generated data
        } catch (error) {
          // Rollback optimistic update
          set(state => ({
            responses: {
              ...state.responses,
              [responseKey]: currentResponses[responseKey] // Restore original or remove
            },
            error: (error as APIError).message || 'Failed to submit assessment response'
          }))
          
          // Remove the failed response if it didn't exist before
          if (!currentResponses[responseKey]) {
            set(state => {
              const newResponses = { ...state.responses }
              delete newResponses[responseKey]
              return { responses: newResponses }
            })
          }
          
          throw error
        }
      },

      // Set current assessment
      setCurrentAssessment: (assessment: Assessment | null) => {
        set({ currentAssessment: assessment })
      }
    }),
    {
      name: 'assessments-store',
      partialize: (state: AssessmentsStore) => ({
        assessments: state.assessments,
        responses: state.responses
      })
    }
  )
)