import { useCallback } from 'react'
import { useAssessmentsStore } from '../stores/assessments'
import { useUIStore } from '../stores/ui'
import type { Assessment, AssessmentResponse } from '../types/assessment'

// Custom hook for assessments management
export const useAssessments = () => {
  const {
    assessments,
    responses,
    currentAssessment,
    loading,
    error,
    fetchAssessment,
    updateAssessment,
    submitResponse,
    setCurrentAssessment
  } = useAssessmentsStore()

  const addNotification = useUIStore(state => state.addNotification)

  // Enhanced update assessment with notification
  const updateAssessmentWithNotification = useCallback(async (jobId: string, assessment: Assessment) => {
    try {
      await updateAssessment(jobId, assessment)
      addNotification({
        type: 'success',
        title: 'Assessment Updated',
        message: `"${assessment.title}" has been updated successfully`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Assessment',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [updateAssessment, addNotification])

  // Enhanced submit response with notification
  const submitResponseWithNotification = useCallback(async (assessmentId: string, response: AssessmentResponse) => {
    try {
      await submitResponse(assessmentId, response)
      addNotification({
        type: 'success',
        title: 'Assessment Submitted',
        message: 'Your assessment has been submitted successfully'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Submit Assessment',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [submitResponse, addNotification])

  // Get assessment by job ID
  const getAssessmentByJobId = useCallback((jobId: string): Assessment | undefined => {
    return assessments[jobId]
  }, [assessments])

  // Get response by assessment and candidate ID
  const getResponse = useCallback((assessmentId: string, candidateId: string): AssessmentResponse | undefined => {
    const responseKey = `${assessmentId}-${candidateId}`
    return responses[responseKey]
  }, [responses])

  // Check if assessment exists for job
  const hasAssessment = useCallback((jobId: string): boolean => {
    return Boolean(assessments[jobId])
  }, [assessments])

  // Check if candidate has submitted response
  const hasSubmittedResponse = useCallback((assessmentId: string, candidateId: string): boolean => {
    const responseKey = `${assessmentId}-${candidateId}`
    return Boolean(responses[responseKey])
  }, [responses])

  // Get all responses for an assessment
  const getAssessmentResponses = useCallback((assessmentId: string): AssessmentResponse[] => {
    return Object.entries(responses)
      .filter(([key]) => key.startsWith(`${assessmentId}-`))
      .map(([, response]) => response)
  }, [responses])

  // Get candidate responses across all assessments
  const getCandidateResponses = useCallback((candidateId: string): AssessmentResponse[] => {
    return Object.entries(responses)
      .filter(([key]) => key.endsWith(`-${candidateId}`))
      .map(([, response]) => response)
  }, [responses])

  // Calculate assessment completion rate
  const getCompletionRate = useCallback((assessmentId: string, totalCandidates: number): number => {
    const responseCount = getAssessmentResponses(assessmentId).length
    return totalCandidates > 0 ? (responseCount / totalCandidates) * 100 : 0
  }, [getAssessmentResponses])

  // Validate assessment structure
  const validateAssessment = useCallback((assessment: Assessment): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!assessment.title?.trim()) {
      errors.push('Assessment title is required')
    }

    if (!assessment.sections || assessment.sections.length === 0) {
      errors.push('Assessment must have at least one section')
    }

    assessment.sections?.forEach((section, sectionIndex) => {
      if (!section.title?.trim()) {
        errors.push(`Section ${sectionIndex + 1} title is required`)
      }

      if (!section.questions || section.questions.length === 0) {
        errors.push(`Section "${section.title}" must have at least one question`)
      }

      section.questions?.forEach((question, questionIndex) => {
        if (!question.title?.trim()) {
          errors.push(`Question ${questionIndex + 1} in section "${section.title}" title is required`)
        }

        if (['single-choice', 'multi-choice'].includes(question.type)) {
          if (!question.options || question.options.length < 2) {
            errors.push(`Question "${question.title}" must have at least 2 options`)
          }
        }
      })
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [])

  // Create a new assessment template
  const createAssessmentTemplate = useCallback((jobId: string, title: string): Assessment => {
    return {
      id: `assessment-${Date.now()}`,
      jobId,
      title,
      sections: [
        {
          id: `section-${Date.now()}`,
          title: 'General Questions',
          questions: [],
          order: 0
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }, [])

  return {
    // State
    assessments,
    responses,
    currentAssessment,
    loading,
    error,
    
    // Actions
    fetchAssessment,
    updateAssessment: updateAssessmentWithNotification,
    submitResponse: submitResponseWithNotification,
    setCurrentAssessment,
    
    // Utility functions
    getAssessmentByJobId,
    getResponse,
    hasAssessment,
    hasSubmittedResponse,
    getAssessmentResponses,
    getCandidateResponses,
    getCompletionRate,
    validateAssessment,
    createAssessmentTemplate
  }
}