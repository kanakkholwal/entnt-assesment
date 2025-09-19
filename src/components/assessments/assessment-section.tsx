import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { QuestionBuilder } from './question-builder'
import type { AssessmentSection as AssessmentSectionType, Question } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface AssessmentSectionProps {
  section: AssessmentSectionType
  onUpdate: (updates: Partial<AssessmentSectionType>) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddQuestion: (question: Question) => void
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void
  onDeleteQuestion: (questionId: string) => void
  isDragging?: boolean
  allQuestions?: Question[] // All questions from all sections for conditional logic
}

export function AssessmentSection({
  section,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  isDragging,
  allQuestions = []
}: AssessmentSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: section.id })

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  // Handle title update
  const handleTitleUpdate = (title: string) => {
    onUpdate({ title })
    setIsEditingTitle(false)
  }

  // Handle title key press
  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleUpdate(e.currentTarget.value)
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
    }
  }

  // Add new question
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'short-text',
      title: 'New Question',
      required: false,
      order: section.questions.length
    }
    onAddQuestion(newQuestion)
  }

  // Handle question drag start
  const handleQuestionDragStart = (event: DragStartEvent) => {
    setActiveQuestionId(event.active.id as string)
  }

  // Handle question drag end
  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveQuestionId(null)

    if (!over || active.id === over.id) {
      return
    }

    const activeIndex = section.questions.findIndex(q => q.id === active.id)
    const overIndex = section.questions.findIndex(q => q.id === over.id)

    if (activeIndex === -1 || overIndex === -1) {
      return
    }

    const newQuestions = [...section.questions]
    const [movedQuestion] = newQuestions.splice(activeIndex, 1)
    newQuestions.splice(overIndex, 0, movedQuestion)

    // Update order values
    const reorderedQuestions = newQuestions.map((question, index) => ({
      ...question,
      order: index
    }))

    onUpdate({ questions: reorderedQuestions })
  }

  const activeQuestion = activeQuestionId ? section.questions.find(q => q.id === activeQuestionId) : null

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn(
        "transition-all duration-200",
        isDragging || isSortableDragging ? "shadow-lg border-blue-200" : "",
        isCollapsed ? "pb-0" : ""
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </Button>

            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <Input
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  onBlur={(e) => handleTitleUpdate(e.target.value)}
                  onKeyDown={handleTitleKeyPress}
                  className="text-sm font-medium"
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {section.title}
                </CardTitle>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
              </Badge>

              <Button
                variant="ghost"
                size="icon_sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-0"
              >
                {isCollapsed ? (
                  <ChevronDown />
                ) : (
                  <ChevronUp  />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon_sm"
                onClick={onDuplicate}
                className="p-0"
              >
                <Copy  />
              </Button>

              <Button
                variant="ghost"
                size="icon_sm"
                onClick={onDelete}
                className="p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="pt-0">
            {/* Questions */}
            {section.questions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  No questions in this section yet
                </p>
                <Button onClick={handleAddQuestion} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleQuestionDragStart}
                onDragEnd={handleQuestionDragEnd}
              >
                <SortableContext
                  items={section.questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {section.questions.map((question) => (
                      <QuestionBuilder
                        key={question.id}
                        question={question}
                        onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                        onDelete={() => onDeleteQuestion(question.id)}
                        isDragging={activeQuestionId === question.id}
                        availableQuestions={allQuestions}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeQuestion ? (
                    <div className="rotate-1 scale-105">
                      <QuestionBuilder
                        question={activeQuestion}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        isDragging={true}
                        availableQuestions={allQuestions}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Add Question Button */}
            {section.questions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleAddQuestion} size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}