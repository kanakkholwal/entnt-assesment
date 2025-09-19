import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Save, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Question, ValidationError, AssessmentResponse } from '@/types/assessment'
import { 
  validateQuestionResponse, 
  shouldShowQuestion, 
  shouldRequireQuestion, 
  shouldDisableQuestion,
  getVisibleQuestions,
  getRequiredQuestions
} from '@/utils/validation'
import { useAssessmentsStore } from '@/stores/assessments'
import { useAssessmentResponse } from '@/hooks/useAssessmentResponse'
import { cn } from '@/lib/utils'

interface AssessmentRuntimeProps {
  assessmentId: string
  candidateId: string
  onSubmit?: (response: AssessmentResponse) => void
  onSave?: (response: Partial<AssessmentResponse>) => void
  className?: string
}

interface QuestionRuntimeProps {
  question: Question
  value?: any
  onChange?: (value: any) => void
  sectionIndex: number
  questionIndex: number
  allResponses: Record<string, any>
  errors?: ValidationError[]
  disabled?: boolean
}

function QuestionRuntime({ 
  question, 
  value, 
  onChange, 
  sectionIndex, 
  questionIndex,
  allResponses,
  errors = [],
  disabled = false
}: QuestionRuntimeProps) {
  const questionNumber = `${sectionIndex + 1}.${questionIndex + 1}`
  
  // Check conditional logic
  const isVisible = shouldShowQuestion(question, allResponses)
  const isRequired = shouldRequireQuestion(question, allResponses)
  const isDisabled = disabled || shouldDisableQuestion(question, allResponses)
  
  // Don't render if hidden
  if (!isVisible) {
    return null
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a file object with metadata
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
      onChange?.(fileData)
    }
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'short-text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Enter your answer..."
            maxLength={question.validation?.maxLength}
            disabled={isDisabled}
            className={cn(
              "mt-2",
              errors.length > 0 && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        )

      case 'long-text':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Enter your answer..."
            maxLength={question.validation?.maxLength}
            disabled={isDisabled}
            className={cn(
              "mt-2 min-h-[120px]",
              errors.length > 0 && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        )

      case 'numeric':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : '')}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
            disabled={isDisabled}
            className={cn(
              "mt-2",
              errors.length > 0 && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        )

      case 'single-choice':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={isDisabled}
            className="mt-2"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${question.id}-${index}`}
                  disabled={isDisabled}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`} 
                  className={cn(
                    "text-sm cursor-pointer",
                    isDisabled && "text-gray-400 cursor-not-allowed"
                  )}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'multi-choice':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={selectedValues.includes(option)}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => {
                    if (isDisabled) return
                    if (checked) {
                      onChange?.([...selectedValues, option])
                    } else {
                      onChange?.(selectedValues.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`} 
                  className={cn(
                    "text-sm cursor-pointer",
                    isDisabled && "text-gray-400 cursor-not-allowed"
                  )}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'file-upload':
        return (
          <div className="mt-2">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-1">
                Click to upload or drag and drop
              </p>
              {question.validation?.fileTypes && (
                <p className="text-xs text-gray-500 mb-2">
                  Accepted: {question.validation.fileTypes.join(', ')}
                </p>
              )}
              {question.validation?.maxFileSize && (
                <p className="text-xs text-gray-500 mb-2">
                  Max size: {question.validation.maxFileSize}MB
                </p>
              )}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isDisabled}
                accept={question.validation?.fileTypes?.join(',')}
                className="hidden"
                id={`file-${question.id}`}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                disabled={isDisabled}
                onClick={() => document.getElementById(`file-${question.id}`)?.click()}
              >
                Choose File
              </Button>
            </div>
            {value && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <FileText className="h-4 w-4" />
                <span>{value.name || 'Selected file'}</span>
                {value.size && (
                  <span className="text-xs text-gray-500">
                    ({(value.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const getValidationMessage = () => {
    if (!question.validation) return null

    const messages = []
    
    if (isRequired) {
      messages.push('Required')
    }
    
    if (question.validation.maxLength) {
      messages.push(`Max ${question.validation.maxLength} characters`)
    }
    
    if (question.validation.min !== undefined && question.validation.max !== undefined) {
      messages.push(`Range: ${question.validation.min} - ${question.validation.max}`)
    } else if (question.validation.min !== undefined) {
      messages.push(`Min: ${question.validation.min}`)
    } else if (question.validation.max !== undefined) {
      messages.push(`Max: ${question.validation.max}`)
    }

    return messages.length > 0 ? messages.join(' • ') : null
  }

  const validationMessage = getValidationMessage()

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs font-mono mt-1 flex-shrink-0">
          {questionNumber}
        </Badge>
        <div className="flex-1 min-w-0">
          <Label className={cn(
            "text-sm font-medium text-gray-900 dark:text-gray-100",
            isDisabled && "text-gray-400"
          )}>
            {question.title}
            {isRequired && (
              <span className="text-red-500 ml-1">*</span>
            )}
            {isDisabled && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Disabled
              </Badge>
            )}
          </Label>
          {question.description && (
            <p className={cn(
              "text-sm text-muted-foreground dark:text-gray-400 mt-1",
              isDisabled && "text-gray-500"
            )}>
              {question.description}
            </p>
          )}
        </div>
      </div>

      {renderQuestionInput()}

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation hints */}
      {validationMessage && errors.length === 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  )
}

export function AssessmentRuntime({ 
  assessmentId, 
  candidateId,
  onSubmit,
  onSave,
  className 
}: AssessmentRuntimeProps) {
  const { assessments } = useAssessmentsStore()
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationError[]>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the assessment response hook for state management and persistence
  const {
    responses: currentResponses,
    isLoading,
    isSubmitted,
    lastSaved,
    isSaving,
    updateResponse,
    saveProgress,
    submitAssessment
  } = useAssessmentResponse({
    assessmentId,
    candidateId,
    autoSave: true,
    autoSaveInterval: 30000
  })

  // Get assessment from store
  const assessment = Object.values(assessments).find(a => a.id === assessmentId)

  // Show loading state while loading existing response
  useEffect(() => {
    if (isSubmitted) {
      toast.info('You have already submitted this assessment')
    }
  }, [isSubmitted])

  const handleResponseChange = useCallback((questionId: string, value: any) => {
    updateResponse(questionId, value)
    
    // Clear validation errors for this question when value changes
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }, [updateResponse, validationErrors])

  const handleSave = async (silent = false) => {
    if (isSubmitted) return

    try {
      await saveProgress()
      onSave?.({ 
        assessmentId,
        candidateId,
        responses: currentResponses,
        completedSections: assessment?.sections.slice(0, currentSection + 1).map(s => s.id) || [],
        isComplete: false
      })
      
      if (!silent) {
        toast.success('Progress saved')
      }
    } catch (error) {
      console.error('Failed to save response:', error)
      if (!silent) {
        toast.error('Failed to save progress')
      }
    }
  }

  const handleSubmit = async () => {
    if (!assessment || isSubmitted) return

    // Validate all visible questions
    const allQuestions = assessment.sections.flatMap(section => section.questions)
    const visibleQuestions = getVisibleQuestions(allQuestions, currentResponses)
    const requiredQuestions = getRequiredQuestions(allQuestions, currentResponses)

    const newErrors: Record<string, ValidationError[]> = {}
    let hasErrors = false

    for (const question of visibleQuestions) {
      const errors = validateQuestionResponse(question, currentResponses[question.id], currentResponses)
      if (errors.length > 0) {
        newErrors[question.id] = errors
        hasErrors = true
      }
    }

    setValidationErrors(newErrors)

    if (hasErrors) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    // Check if all required questions are answered
    const unansweredRequired = requiredQuestions.filter(question => {
      const value = currentResponses[question.id]
      return value === undefined || value === null || value === ''
    })

    if (unansweredRequired.length > 0) {
      toast.error(`Please answer all required questions (${unansweredRequired.length} remaining)`)
      return
    }

    setIsSubmitting(true)
    try {
      const completedSections = assessment.sections.map(section => section.id)
      
      await submitAssessment(completedSections)
      
      const responseData: AssessmentResponse = {
        id: crypto.randomUUID(),
        assessmentId,
        candidateId,
        responses: currentResponses,
        completedSections,
        isComplete: true,
        submittedAt: new Date()
      }

      onSubmit?.(responseData)
      toast.success('Assessment submitted successfully!')
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      toast.error('Failed to submit assessment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Loading Assessment
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Please wait while we load your assessment...
          </p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Assessment not found
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            The requested assessment could not be loaded
          </p>
        </div>
      </div>
    )
  }

  if (assessment.sections.length === 0) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No content available
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            This assessment has no sections or questions
          </p>
        </div>
      </div>
    )
  }

  // Get all questions from all sections
  const allQuestions = assessment.sections.flatMap(section => section.questions)
  
  // Get visible questions based on conditional logic
  const visibleQuestions = getVisibleQuestions(allQuestions, currentResponses)
  const requiredQuestions = getRequiredQuestions(allQuestions, currentResponses)

  const totalQuestions = visibleQuestions.length
  
  const answeredQuestions = visibleQuestions.filter(question => {
    const value = currentResponses[question.id]
    return value !== undefined && value !== null && value !== ''
  }).length

  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  
  // Check if all required questions are answered
  const allRequiredAnswered = requiredQuestions.every(question => {
    const value = currentResponses[question.id]
    return value !== undefined && value !== null && value !== ''
  })
  
  const hasValidationErrors = Object.keys(validationErrors).length > 0

  const currentSectionData = assessment.sections[currentSection]
  const isLastSection = currentSection === assessment.sections.length - 1
  const isFirstSection = currentSection === 0

  if (isSubmitted) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Assessment Submitted
          </h2>
          <p className="text-muted-foreground dark:text-gray-400 mb-4">
            Thank you for completing the assessment. Your responses have been saved.
          </p>
          <div className="text-sm text-gray-500">
            Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", className)}>
      {/* Assessment Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {assessment.title}
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mb-4">
          Section {currentSection + 1} of {assessment.sections.length}
        </p>
        
        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{answeredQuestions} of {totalQuestions} questions</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Auto-save indicator */}
        {lastSaved && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
            <Clock className="h-3 w-3" />
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center justify-between">
            <span>{currentSectionData.title}</span>
            <Badge variant="outline">
              Section {currentSection + 1}
            </Badge>
          </CardTitle>
          {currentSectionData.description && (
            <p className="text-muted-foreground dark:text-gray-400">
              {currentSectionData.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {currentSectionData.questions.map((question, questionIndex) => (
            <QuestionRuntime
              key={question.id}
              question={question}
              value={currentResponses[question.id]}
              onChange={(value) => handleResponseChange(question.id, value)}
              sectionIndex={currentSection}
              questionIndex={questionIndex}
              allResponses={currentResponses}
              errors={validationErrors[question.id]}
              disabled={isSubmitted}
            />
          ))}
        </CardContent>
      </Card>

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={isFirstSection || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {!isLastSection && (
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.min(assessment.sections.length - 1, currentSection + 1))}
              disabled={isSubmitting}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Progress'}
          </Button>

          {isLastSection && (
            <Button
              onClick={handleSubmit}
              disabled={!allRequiredAnswered || hasValidationErrors || isSubmitting}
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          )}
        </div>
      </div>

      {/* Validation Summary */}
      {hasValidationErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors above before proceeding.
          </AlertDescription>
        </Alert>
      )}
      
      {!allRequiredAnswered && !hasValidationErrors && isLastSection && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please answer all required questions to submit ({requiredQuestions.length - requiredQuestions.filter(q => {
              const value = currentResponses[q.id]
              return value !== undefined && value !== null && value !== ''
            }).length} remaining)
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}