import { useState, useEffect, useCallback } from 'react'
import { assessmentResponsesService } from '@/db/services'


interface UseAssessmentResponseOptions {
  assessmentId: string
  candidateId: string
  autoSave?: boolean
  autoSaveInterval?: number
}

interface UseAssessmentResponseReturn {
  responses: Record<string, any>
  isLoading: boolean
  isSubmitted: boolean
  lastSaved: Date | null
  isSaving: boolean
  updateResponse: (questionId: string, value: any) => void
  saveProgress: () => Promise<void>
  submitAssessment: (completedSections: string[]) => Promise<void>
  loadExistingResponse: () => Promise<void>
}

export function useAssessmentResponse({
  assessmentId,
  candidateId,
  autoSave = true,
  autoSaveInterval = 30000 // 30 seconds
}: UseAssessmentResponseOptions): UseAssessmentResponseReturn {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [existingResponseId, setExistingResponseId] = useState<string | null>(null)

  // Load existing response on mount
  const loadExistingResponse = useCallback(async () => {
    setIsLoading(true)
    try {
      const existingResponse = await assessmentResponsesService.getByAssessmentAndCandidate(
        assessmentId,
        candidateId
      )

      if (existingResponse) {
        setResponses(existingResponse.responses)
        setIsSubmitted(existingResponse.isComplete)
        setExistingResponseId(existingResponse.id)
        setLastSaved(existingResponse.submittedAt)
      }
    } catch (error) {
      console.error('Failed to load existing response:', error)
    } finally {
      setIsLoading(false)
    }
  }, [assessmentId, candidateId])

  useEffect(() => {
    loadExistingResponse()
  }, [loadExistingResponse])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || Object.keys(responses).length === 0 || isSubmitted) {
      return
    }

    const interval = setInterval(() => {
      saveProgress()
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [responses, autoSave, autoSaveInterval, isSubmitted])

  const updateResponse = useCallback((questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }, [])

  const saveProgress = useCallback(async () => {
    if (isSubmitted || isSaving) return

    setIsSaving(true)
    try {
      const responseData = {
        assessmentId,
        candidateId,
        responses,
        completedSections: [], // Will be updated when sections are completed
        isComplete: false
      }

      if (existingResponseId) {
        await assessmentResponsesService.update(existingResponseId, responseData)
      } else {
        const newResponse = await assessmentResponsesService.submit(responseData)
        setExistingResponseId(newResponse.id)
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [assessmentId, candidateId, responses, existingResponseId, isSubmitted, isSaving])

  const submitAssessment = useCallback(async (completedSections: string[]) => {
    if (isSubmitted) return

    setIsSaving(true)
    try {
      const responseData = {
        assessmentId,
        candidateId,
        responses,
        completedSections,
        isComplete: true
      }

      if (existingResponseId) {
        await assessmentResponsesService.update(existingResponseId, responseData)
      } else {
        const newResponse = await assessmentResponsesService.submit(responseData)
        setExistingResponseId(newResponse.id)
      }

      setIsSubmitted(true)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [assessmentId, candidateId, responses, existingResponseId, isSubmitted])

  return {
    responses,
    isLoading,
    isSubmitted,
    lastSaved,
    isSaving,
    updateResponse,
    saveProgress,
    submitAssessment,
    loadExistingResponse
  }
}