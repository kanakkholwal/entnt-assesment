import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  GripVertical, 
  Trash2, 
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  AlertCircle,
  Link
} from 'lucide-react'
import { QuestionTypeSelector } from './question-type-selector'
import { ConditionalLogicBuilder } from './conditional-logic-builder'
import type { Question, QuestionType } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface QuestionBuilderProps {
  question: Question
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  isDragging?: boolean
  availableQuestions?: Question[] // For conditional logic dependencies
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'single-choice': 'Single Choice',
  'multi-choice': 'Multiple Choice',
  'short-text': 'Short Text',
  'long-text': 'Long Text',
  'numeric': 'Numeric',
  'file-upload': 'File Upload'
}

export function QuestionBuilder({
  question,
  onUpdate,
  onDelete,
  isDragging,
  availableQuestions = []
}: QuestionBuilderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  // Handle question type change
  const handleTypeChange = (type: QuestionType) => {
    const updates: Partial<Question> = { type }
    
    // Reset type-specific properties
    if (type === 'single-choice' || type === 'multi-choice') {
      updates.options = question.options || ['Option 1', 'Option 2']
    } else {
      updates.options = undefined
    }
    
    if (type === 'numeric') {
      updates.validation = question.validation || { min: 0, max: 100 }
    } else if (type === 'short-text' || type === 'long-text') {
      updates.validation = question.validation || { maxLength: type === 'short-text' ? 100 : 1000 }
    } else {
      updates.validation = undefined
    }
    
    onUpdate(updates)
  }

  // Handle option changes for choice questions
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
    onUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || []
    onUpdate({ options: newOptions })
  }

  // Handle validation changes
  const handleValidationChange = (field: string, value: any) => {
    const newValidation = { ...question.validation, [field]: value }
    onUpdate({ validation: newValidation })
  }

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
              <Input
                value={question.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter question title..."
                className="text-sm font-medium border-none shadow-none p-0 h-auto focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {QUESTION_TYPE_LABELS[question.type]}
              </Badge>

              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}

              <Button
                variant="ghost"
                size="icon_sm"
                onClick={() => setShowSettings(!showSettings)}
                className="p-0"
              >
                <Settings />
              </Button>

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
                onClick={onDelete}
                className="p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2  />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="pt-0 space-y-4">
            {/* Question Type Selector */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Question Type
              </Label>
              <QuestionTypeSelector
                value={question.type}
                onChange={handleTypeChange}
                className="mt-1"
              />
            </div>

            {/* Question Description */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Description (Optional)
              </Label>
              <Textarea
                value={question.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Add additional context or instructions..."
                className="mt-1 min-h-[60px]"
              />
            </div>

            {/* Type-specific Configuration */}
            {(question.type === 'single-choice' || question.type === 'multi-choice') && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Options
                </Label>
                <div className="mt-1 space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {(question.options?.length || 0) > 2 && (
                        <Button
                          variant="ghost"
                          size="icon_sm"
                          onClick={() => removeOption(index)}
                          className="p-0 text-red-600 hover:text-red-700"
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus/>
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Required Question</Label>
                  <Switch
                    checked={question.required}
                    onCheckedChange={(required) => onUpdate({ required })}
                  />
                </div>

                {/* Validation Rules */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm font-medium">Validation Rules</Label>
                  </div>

                  {/* Text validation */}
                  {(question.type === 'short-text' || question.type === 'long-text') && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            Minimum Length
                          </Label>
                          <Input
                            type="number"
                            value={question.validation?.minLength || ''}
                            onChange={(e) => handleValidationChange('minLength', Number(e.target.value) || undefined)}
                            placeholder="Min characters"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            Maximum Length
                          </Label>
                          <Input
                            type="number"
                            value={question.validation?.maxLength || ''}
                            onChange={(e) => handleValidationChange('maxLength', Number(e.target.value) || undefined)}
                            placeholder="Max characters"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Pattern (Regex)
                        </Label>
                        <Input
                          value={question.validation?.pattern || ''}
                          onChange={(e) => handleValidationChange('pattern', e.target.value || undefined)}
                          placeholder="^[A-Za-z0-9]+$"
                          className="mt-1"
                        />
                      </div>
                      {question.validation?.pattern && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            Pattern Error Message
                          </Label>
                          <Input
                            value={question.validation?.patternMessage || ''}
                            onChange={(e) => handleValidationChange('patternMessage', e.target.value || undefined)}
                            placeholder="Please enter a valid format"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Numeric validation */}
                  {question.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Minimum Value
                        </Label>
                        <Input
                          type="number"
                          value={question.validation?.min ?? ''}
                          onChange={(e) => handleValidationChange('min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Min"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Maximum Value
                        </Label>
                        <Input
                          type="number"
                          value={question.validation?.max ?? ''}
                          onChange={(e) => handleValidationChange('max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Max"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Multi-choice validation */}
                  {question.type === 'multi-choice' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Minimum Selections
                        </Label>
                        <Input
                          type="number"
                          value={question.validation?.min ?? ''}
                          onChange={(e) => handleValidationChange('min', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Min selections"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Maximum Selections
                        </Label>
                        <Input
                          type="number"
                          value={question.validation?.max ?? ''}
                          onChange={(e) => handleValidationChange('max', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Max selections"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* File upload validation */}
                  {question.type === 'file-upload' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Accepted File Types
                        </Label>
                        <Input
                          value={question.validation?.fileTypes?.join(', ') || ''}
                          onChange={(e) => handleValidationChange('fileTypes', e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined)}
                          placeholder="pdf, doc, docx, jpg, png"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            Min File Size (MB)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={question.validation?.minFileSize ?? ''}
                            onChange={(e) => handleValidationChange('minFileSize', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="0.1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            Max File Size (MB)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={question.validation?.maxFileSize ?? ''}
                            onChange={(e) => handleValidationChange('maxFileSize', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="10"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom validation message */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Custom Error Message
                    </Label>
                    <Input
                      value={question.validation?.customMessage || ''}
                      onChange={(e) => handleValidationChange('customMessage', e.target.value || undefined)}
                      placeholder="Custom error message for validation failures"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Conditional Logic */}
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Link className="size-4 text-purple-500" />
                    <Label className="text-sm font-medium">Conditional Logic</Label>
                  </div>
                  
                  <ConditionalLogicBuilder
                    rule={question.conditionalLogic}
                    availableQuestions={availableQuestions.filter(q => q.id !== question.id)}
                    onChange={(rule) => onUpdate({ conditionalLogic: rule })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}