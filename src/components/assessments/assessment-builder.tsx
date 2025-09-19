import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  GripVertical,

} from 'lucide-react'
import { AssessmentSection } from './assessment-section'
import { AssessmentPreview } from './assessment-preview'
import { toast } from 'sonner'
import type { Assessment, AssessmentSection as AssessmentSectionType, Question } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface AssessmentBuilderProps {
  jobId: string
  assessment?: Assessment
  onSave: (assessment: Assessment) => void
  className?: string
}

export function AssessmentBuilder({ 
  jobId, 
  assessment: initialAssessment, 
  onSave, 
  className 
}: AssessmentBuilderProps) {
  const [assessment, setAssessment] = useState<Assessment>(() => 
    initialAssessment || {
      id: crypto.randomUUID(),
      jobId,
      title: 'New Assessment',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  )
  
  const [showPreview, setShowPreview] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update assessment title
  const updateTitle = useCallback((title: string) => {
    setAssessment(prev => ({
      ...prev,
      title,
      updatedAt: new Date()
    }))
  }, [])

  // Add new section
  const addSection = useCallback(() => {
    const newSection: AssessmentSectionType = {
      id: crypto.randomUUID(),
      title: `Section ${assessment.sections.length + 1}`,
      questions: [],
      order: assessment.sections.length
    }

    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date()
    }))
  }, [assessment.sections.length])

  // Update section
  const updateSection = useCallback((sectionId: string, updates: Partial<AssessmentSectionType>) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      ),
      updatedAt: new Date()
    }))
  }, [])

  // Delete section
  const deleteSection = useCallback((sectionId: string) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections
        .filter(section => section.id !== sectionId)
        .map((section, index) => ({ ...section, order: index })),
      updatedAt: new Date()
    }))
  }, [])

  // Duplicate section
  const duplicateSection = useCallback((sectionId: string) => {
    const sectionToDuplicate = assessment.sections.find(s => s.id === sectionId)
    if (!sectionToDuplicate) return

    const duplicatedSection: AssessmentSectionType = {
      ...sectionToDuplicate,
      id: crypto.randomUUID(),
      title: `${sectionToDuplicate.title} (Copy)`,
      order: assessment.sections.length,
      questions: sectionToDuplicate.questions.map(question => ({
        ...question,
        id: crypto.randomUUID()
      }))
    }

    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, duplicatedSection],
      updatedAt: new Date()
    }))
  }, [assessment.sections])

  // Add question to section
  const addQuestion = useCallback((sectionId: string, question: Question) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: [...section.questions, { ...question, order: section.questions.length }]
            }
          : section
      ),
      updatedAt: new Date()
    }))
  }, [])

  // Update question
  const updateQuestion = useCallback((sectionId: string, questionId: string, updates: Partial<Question>) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === questionId
                  ? { ...question, ...updates }
                  : question
              )
            }
          : section
      ),
      updatedAt: new Date()
    }))
  }, [])

  // Delete question
  const deleteQuestion = useCallback((sectionId: string, questionId: string) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions
                .filter(question => question.id !== questionId)
                .map((question, index) => ({ ...question, order: index }))
            }
          : section
      ),
      updatedAt: new Date()
    }))
  }, [])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const activeIndex = assessment.sections.findIndex(section => section.id === active.id)
    const overIndex = assessment.sections.findIndex(section => section.id === over.id)

    if (activeIndex === -1 || overIndex === -1) {
      return
    }

    const newSections = [...assessment.sections]
    const [movedSection] = newSections.splice(activeIndex, 1)
    newSections.splice(overIndex, 0, movedSection)

    // Update order values
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }))

    setAssessment(prev => ({
      ...prev,
      sections: reorderedSections,
      updatedAt: new Date()
    }))
  }

  // Save assessment
  const handleSave = async () => {
    if (!assessment.title.trim()) {
      toast.error('Assessment title is required')
      return
    }

    if (assessment.sections.length === 0) {
      toast.error('Assessment must have at least one section')
      return
    }

    const hasQuestionsInSections = assessment.sections.some(section => section.questions.length > 0)
    if (!hasQuestionsInSections) {
      toast.error('Assessment must have at least one question')
      return
    }

    setIsSaving(true)
    try {
      await onSave(assessment)
      toast.success('Assessment saved successfully')
    } catch (error) {
      toast.error('Failed to save assessment')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const activeSection = activeId ? assessment.sections.find(s => s.id === activeId) : null

  return (
    <div className={cn("flex h-full", className)}>
      {/* Builder Panel */}
      <div className={cn("flex-1 flex flex-col", showPreview ? "w-1/2" : "w-full")}>
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-md">
              <Label htmlFor="assessment-title" className="text-sm font-medium">
                Assessment Title
              </Label>
              <Input
                id="assessment-title"
                value={assessment.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Enter assessment title..."
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Badge variant="secondary" className="text-xs">
                {assessment.sections.length} section{assessment.sections.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {assessment.sections.reduce((total, section) => total + section.questions.length, 0)} question{assessment.sections.reduce((total, section) => total + section.questions.length, 0) !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={addSection} size="sm">
              <Plus className="size-4 mr-2" />
              Add Section
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="size-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
            >
              <Save className="size-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-6">
          {assessment.sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-xl">
              <div className="text-foreground mb-4">
                <Settings className="size-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">
                  No sections yet
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first section to start building the assessment
                </p>
              </div>
              <Button onClick={addSection} size="sm" variant="default_light">
                <Plus />
                Add First Section
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={assessment.sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  {assessment.sections.map((section) => {
                    // Get all questions from all sections for conditional logic
                    const allQuestions = assessment.sections.flatMap(s => s.questions)
                    
                    return (
                      <AssessmentSection
                        key={section.id}
                        section={section}
                        onUpdate={(updates) => updateSection(section.id, updates)}
                        onDelete={() => deleteSection(section.id)}
                        onDuplicate={() => duplicateSection(section.id)}
                        onAddQuestion={(question) => addQuestion(section.id, question)}
                        onUpdateQuestion={(questionId, updates) => updateQuestion(section.id, questionId, updates)}
                        onDeleteQuestion={(questionId) => deleteQuestion(section.id, questionId)}
                        isDragging={activeId === section.id}
                        allQuestions={allQuestions}
                      />
                    )
                  })}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeSection ? (
                  <div className="rotate-2 scale-105">
                    <Card className="shadow-lg border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <GripVertical className="size-4 text-gray-400" />
                          {activeSection.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <>
          <Separator orientation="vertical" />
          <div className="w-1/2 flex flex-col">
            <div className="flex-shrink-0 p-6 border-b bg-card">
              <h3 className="text-lg font-semibold text-foreground">
                Live Preview
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                See how candidates will experience this assessment
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AssessmentPreview assessment={assessment} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}