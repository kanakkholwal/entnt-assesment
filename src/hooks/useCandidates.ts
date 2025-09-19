import { useCallback } from 'react'
import { useCandidatesStore } from '../stores/candidates'
import { useUIStore } from '../stores/ui'
import type { Candidate, CandidateStage } from '../types/candidate'

// Custom hook for candidates management
export const useCandidates = () => {
  const {
    candidates,
    selectedCandidate,
    loading,
    error,
    filters,
    pagination,
    fetchCandidates,
    selectCandidate,
    updateCandidateStage,
    addCandidateNote,
    setFilters
  } = useCandidatesStore()

  const addNotification = useUIStore(state => state.addNotification)

  // Enhanced update candidate stage with notification
  const updateCandidateStageWithNotification = useCallback(async (id: string, stage: CandidateStage) => {
    const candidate = candidates.find(c => c.id === id)
    const candidateName = candidate?.name || 'Candidate'
    
    try {
      await updateCandidateStage(id, stage)
      addNotification({
        type: 'success',
        title: 'Candidate Updated',
        message: `${candidateName} moved to ${stage} stage`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Update Candidate',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [candidates, updateCandidateStage, addNotification])

  // Enhanced add candidate note with notification
  const addCandidateNoteWithNotification = useCallback(async (id: string, note: string) => {
    const candidate = candidates.find(c => c.id === id)
    const candidateName = candidate?.name || 'Candidate'
    
    try {
      await addCandidateNote(id, note)
      addNotification({
        type: 'success',
        title: 'Note Added',
        message: `Note added to ${candidateName}'s profile`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Add Note',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      throw error
    }
  }, [candidates, addCandidateNote, addNotification])

  // Search candidates
  const searchCandidates = useCallback((query: string) => {
    setFilters({ search: query })
  }, [setFilters])

  // Filter by stage
  const filterByStage = useCallback((stage: CandidateStage | undefined) => {
    setFilters({ stage })
  }, [setFilters])

  // Filter by job
  const filterByJob = useCallback((jobId: string | undefined) => {
    setFilters({ jobId })
  }, [setFilters])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      stage: undefined,
      jobId: undefined
    })
  }, [setFilters])

  // Get candidate by id
  const getCandidateById = useCallback((id: string): Candidate | undefined => {
    return candidates.find(candidate => candidate.id === id)
  }, [candidates])

  // Get candidates by stage
  const getCandidatesByStage = useCallback((stage: CandidateStage): Candidate[] => {
    return candidates.filter(candidate => candidate.stage === stage)
  }, [candidates])

  // Get candidates by job
  const getCandidatesByJob = useCallback((jobId: string): Candidate[] => {
    return candidates.filter(candidate => candidate.jobId === jobId)
  }, [candidates])

  // Get stage counts for kanban board
  const getStageCounts = useCallback(() => {
    const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']
    
    return stages.reduce((counts, stage) => {
      counts[stage] = candidates.filter(c => c.stage === stage).length
      return counts
    }, {} as Record<CandidateStage, number>)
  }, [candidates])

  // Move candidate to next stage
  const moveToNextStage = useCallback(async (id: string) => {
    const candidate = getCandidateById(id)
    if (!candidate) return

    const stageOrder: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired']
    const currentIndex = stageOrder.indexOf(candidate.stage)
    
    if (currentIndex >= 0 && currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1]
      await updateCandidateStageWithNotification(id, nextStage)
    }
  }, [getCandidateById, updateCandidateStageWithNotification])

  // Move candidate to previous stage
  const moveToPreviousStage = useCallback(async (id: string) => {
    const candidate = getCandidateById(id)
    if (!candidate) return

    const stageOrder: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired']
    const currentIndex = stageOrder.indexOf(candidate.stage)
    
    if (currentIndex > 0) {
      const previousStage = stageOrder[currentIndex - 1]
      await updateCandidateStageWithNotification(id, previousStage)
    }
  }, [getCandidateById, updateCandidateStageWithNotification])

  // Reject candidate
  const rejectCandidate = useCallback(async (id: string) => {
    await updateCandidateStageWithNotification(id, 'rejected')
  }, [updateCandidateStageWithNotification])

  return {
    // State
    candidates,
    selectedCandidate,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    fetchCandidates,
    selectCandidate,
    updateCandidateStage: updateCandidateStageWithNotification,
    addCandidateNote: addCandidateNoteWithNotification,
    
    // Filter actions
    searchCandidates,
    filterByStage,
    filterByJob,
    clearFilters,
    
    // Utility functions
    getCandidateById,
    getCandidatesByStage,
    getCandidatesByJob,
    getStageCounts,
    
    // Stage management
    moveToNextStage,
    moveToPreviousStage,
    rejectCandidate
  }
}