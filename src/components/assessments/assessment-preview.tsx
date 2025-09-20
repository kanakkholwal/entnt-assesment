import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
import { Upload, FileText, AlertCircle } from 'lucide-react'
import type { Assessment, Question, ValidationError } from '@/types/assessment'
import {
  validateQuestionResponse,
  shouldShowQuestion,
  shouldRequireQuestion,
  shouldDisableQuestion,
  getVisibleQuestions,
  getRequiredQuestions
} from '@/utils/validation'
import { cn } from '@/lib/utils'

interface AssessmentPreviewProps {
  assessment: Assessment
  responses?: Record<string, any>
  onResponseChange?: (questionId: string, value: any) => void
  className?: string
}

interface QuestionPreviewProps {
  question: Question
  value?: any
  onChange?: (questionId: string, value: any) => void
  questionId: string
  sectionIndex: number
  questionIndex: number
  allResponses: Record<string, any>
  errors?: ValidationError[]
}

const QuestionPreview = React.memo(function QuestionPreview({
  question,
  value,
  onChange,
  questionId,
  sectionIndex,
  questionIndex,
  allResponses,
  errors = []
}: QuestionPreviewProps) {
  const questionNumber = `${sectionIndex + 1}.${questionIndex + 1}`

  // Memoize conditional logic to prevent recalculation on every render
  const isVisible = useMemo(() => shouldShowQuestion(question, allResponses), [question, allResponses])
  const isRequired = useMemo(() => shouldRequireQuestion(question, allResponses), [question, allResponses])
  const isDisabled = useMemo(() => shouldDisableQuestion(question, allResponses), [question, allResponses])

  // Don't render if hidden
  if (!isVisible) {
    return null
  }

  const renderQuestionInput = useMemo(() => {
    switch (question.type) {
      case 'short-text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange?.(questionId, e.target.value)}
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
            onChange={(e) => onChange?.(questionId, e.target.value)}
            placeholder="Enter your answer..."
            maxLength={question.validation?.maxLength}
            disabled={isDisabled}
            className={cn(
              "mt-2 min-h-[100px]",
              errors.length > 0 && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        )

      case 'numeric':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(questionId, Number(e.target.value))}
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
            onValueChange={(val) => onChange?.(questionId, val)}
            disabled={isDisabled}
            className="mt-2"
            name={`${question.id}`}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${question.id}-${index}`}
                  disabled={isDisabled}
                  className={question.id}
                />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className={cn(
                    "text-sm",
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
                      onChange?.(questionId, [...selectedValues, option])
                    } else {
                      onChange?.(questionId, selectedValues.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className={cn(
                    "text-sm",
                    isDisabled && "text-muted-foreground cursor-not-allowed"
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
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
              <p className="text-sm text-foreground mb-1">
                Click to upload or drag and drop
              </p>
              {question.validation?.fileTypes && (
                <p className="text-xs text-muted-foreground">
                  Accepted: {question.validation.fileTypes.join(', ')}
                </p>
              )}
              <Button variant="outline" size="sm" className="mt-2">
                Choose File
              </Button>
            </div>
            {value && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" />
                <span>{value.name || 'Selected file'}</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }, [question.type, question.options, question.validation, questionId, value, onChange, isDisabled, errors.length])

  // Memoize validation message calculation
  const validationMessage = useMemo(() => {
    if (!question.validation) return null

    const messages = []

    if (question.required) {
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
  }, [question.validation, question.required])

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs font-mono mt-1">
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
              "text-sm text-muted-foreground  mt-1",
              isDisabled && "text-gray-500"
            )}>
              {question.description}
            </p>
          )}
        </div>
      </div>

      {renderQuestionInput}

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation hints */}
      {validationMessage && errors.length === 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3" />
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  )
})

export function AssessmentPreview({
  assessment,
  responses = {},
  onResponseChange,
  className
}: AssessmentPreviewProps) {
  const [currentResponses, setCurrentResponses] = useState<Record<string, any>>(responses)

  // Only sync with external responses when they actually change
  const prevResponses = useRef(responses)
  useEffect(() => {
    // Deep comparison to avoid unnecessary updates
    if (JSON.stringify(prevResponses.current) !== JSON.stringify(responses)) {
      setCurrentResponses(responses)
      prevResponses.current = responses
    }
  }, [responses])

  const handleResponseChange = useCallback((questionId: string, value: any) => {
    setCurrentResponses(prev => {
      const newResponses = { ...prev, [questionId]: value }
      return newResponses
    })
    // Call parent callback after state update
    onResponseChange?.(questionId, value)
  }, [onResponseChange])

  // Memoize all questions to prevent recalculation on every render
  const allQuestions = useMemo(() =>
    assessment.sections.flatMap(section => section.questions),
    [assessment.sections]
  )

  // Memoize visible and required questions based on conditional logic
  const visibleQuestions = useMemo(() =>
    getVisibleQuestions(allQuestions, currentResponses),
    [allQuestions, currentResponses]
  )

  const requiredQuestions = useMemo(() =>
    getRequiredQuestions(allQuestions, currentResponses),
    [allQuestions, currentResponses]
  )

  // Memoize validation errors calculation instead of using useEffect
  const validationErrors = useMemo(() => {
    const newErrors: Record<string, ValidationError[]> = {}

    for (const question of visibleQuestions) {
      const errors = validateQuestionResponse(question, currentResponses[question.id], currentResponses)
      if (errors.length > 0) {
        newErrors[question.id] = errors
      }
    }

    return newErrors
  }, [visibleQuestions, currentResponses])

  // Memoize progress calculations to prevent unnecessary recalculations
  const totalQuestions = visibleQuestions.length

  const answeredQuestions = useMemo(() =>
    visibleQuestions.filter(question => {
      const value = currentResponses[question.id]
      return value !== undefined && value !== null && value !== ''
    }).length,
    [visibleQuestions, currentResponses]
  )

  const progress = useMemo(() =>
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
    [answeredQuestions, totalQuestions]
  )

  // Check if all required questions are answered
  const allRequiredAnswered = useMemo(() =>
    requiredQuestions.every(question => {
      const value = currentResponses[question.id]
      return value !== undefined && value !== null && value !== ''
    }),
    [requiredQuestions, currentResponses]
  )

  const hasValidationErrors = useMemo(() =>
    Object.keys(validationErrors).length > 0,
    [validationErrors]
  )

  if (assessment.sections.length === 0) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <div className="text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foregroind mb-2">
            No content to preview
          </h3>
          <p className="text-sm text-muted-foreground">
            Add sections and questions to see the assessment preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-6 space-y-6", className)}>
      {/* Assessment Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {assessment.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Complete all sections to submit your assessment
        </p>

        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground  mb-2">
            <span>Progress</span>
            <span>{answeredQuestions} of {totalQuestions} questions</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {assessment.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.questions.map((question, questionIndex) => (
                <QuestionPreview
                  key={question.id}
                  question={question}
                  questionId={question.id}
                  value={currentResponses[question.id]}
                  onChange={(value) => handleResponseChange(question.id, value)}
                  sectionIndex={sectionIndex}
                  questionIndex={questionIndex}
                  allResponses={currentResponses}
                  errors={validationErrors[question.id]}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      {totalQuestions > 0 && (
        <div className="text-center pt-6 border-t space-y-4">
          {/* Validation Summary */}
          {hasValidationErrors && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                Please fix the validation errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            disabled={!allRequiredAnswered || hasValidationErrors}
          >
            Submit Assessment
          </Button>

          {!allRequiredAnswered && !hasValidationErrors && (
            <p className="text-sm text-muted-foreground">
              Please answer all required questions to submit ({requiredQuestions.length - requiredQuestions.filter(q => {
                const value = currentResponses[q.id]
                return value !== undefined && value !== null && value !== ''
              }).length} remaining)
            </p>
          )}
        </div>
      )}
    </div>
  )
}