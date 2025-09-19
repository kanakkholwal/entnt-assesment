import type { Question, ValidationRule, ValidationError, ConditionalRule } from '@/types/assessment'

/**
 * Validates a question response against its validation rules
 */
export function validateQuestionResponse(
  question: Question,
  value: any,
  allResponses: Record<string, any> = {}
): ValidationError[] {
  const errors: ValidationError[] = []
  const validation = question.validation

  // Check if question should be shown based on conditional logic
  if (question.conditionalLogic && !shouldShowQuestion(question, allResponses)) {
    return errors // Don't validate hidden questions
  }

  // Required validation
  if ((validation && validation.required) || question.required) {
    if (isEmpty(value)) {
      errors.push({
        field: question.id,
        message: (validation && validation.customMessage) || 'This field is required',
        type: 'required'
      })
      return errors // Don't continue validation if required field is empty
    }
  }

  // Skip other validations if value is empty and not required
  if (isEmpty(value)) {
    return errors
  }

  // Type-specific validations
  switch (question.type) {
    case 'short-text':
    case 'long-text':
      if (validation) {
        validateTextResponse(question, value, validation, errors)
      }
      break
    case 'numeric':
      if (validation) {
        validateNumericResponse(question, value, validation, errors)
      }
      break
    case 'single-choice':
      validateSingleChoiceResponse(question, value, validation || {}, errors)
      break
    case 'multi-choice':
      validateMultiChoiceResponse(question, value, validation || {}, errors)
      break
    case 'file-upload':
      if (validation) {
        validateFileResponse(question, value, validation, errors)
      }
      break
  }

  return errors
}

/**
 * Validates text responses (short-text, long-text)
 */
function validateTextResponse(
  question: Question,
  value: string,
  validation: ValidationRule,
  errors: ValidationError[]
): void {
  if (typeof value !== 'string') {
    errors.push({
      field: question.id,
      message: 'Invalid text format',
      type: 'custom'
    })
    return
  }

  // Length validations
  if (validation.minLength && value.length < validation.minLength) {
    errors.push({
      field: question.id,
      message: `Minimum ${validation.minLength} characters required`,
      type: 'minLength'
    })
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    errors.push({
      field: question.id,
      message: `Maximum ${validation.maxLength} characters allowed`,
      type: 'maxLength'
    })
  }

  // Pattern validation
  if (validation.pattern) {
    try {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        errors.push({
          field: question.id,
          message: validation.patternMessage || 'Invalid format',
          type: 'pattern'
        })
      }
    } catch (e) {
      console.warn('Invalid regex pattern:', validation.pattern)
    }
  }
}

/**
 * Validates numeric responses
 */
function validateNumericResponse(
  question: Question,
  value: number,
  validation: ValidationRule,
  errors: ValidationError[]
): void {
  const numValue = Number(value)
  
  if (isNaN(numValue)) {
    errors.push({
      field: question.id,
      message: 'Please enter a valid number',
      type: 'custom'
    })
    return
  }

  // Range validations
  if (validation.min !== undefined && numValue < validation.min) {
    errors.push({
      field: question.id,
      message: `Value must be at least ${validation.min}`,
      type: 'min'
    })
  }

  if (validation.max !== undefined && numValue > validation.max) {
    errors.push({
      field: question.id,
      message: `Value must be at most ${validation.max}`,
      type: 'max'
    })
  }
}

/**
 * Validates single choice responses
 */
function validateSingleChoiceResponse(
  question: Question,
  value: string,
  _validation: ValidationRule,
  errors: ValidationError[]
): void {
  if (typeof value !== 'string') {
    errors.push({
      field: question.id,
      message: 'Please select an option',
      type: 'custom'
    })
    return
  }

  if (!question.options || !question.options.includes(value)) {
    errors.push({
      field: question.id,
      message: 'Please select a valid option',
      type: 'custom'
    })
  }
}

/**
 * Validates multiple choice responses
 */
function validateMultiChoiceResponse(
  question: Question,
  value: string[],
  validation: ValidationRule,
  errors: ValidationError[]
): void {
  if (!Array.isArray(value)) {
    errors.push({
      field: question.id,
      message: 'Invalid selection format',
      type: 'custom'
    })
    return
  }

  // Check if all selected values are valid options
  if (question.options) {
    const invalidOptions = value.filter(v => !question.options!.includes(v))
    if (invalidOptions.length > 0) {
      errors.push({
        field: question.id,
        message: 'Please select valid options only',
        type: 'custom'
      })
    }
  }

  // Min/max selection validations
  if (validation && validation.min !== undefined && value.length < validation.min) {
    errors.push({
      field: question.id,
      message: `Please select at least ${validation.min} option${validation.min !== 1 ? 's' : ''}`,
      type: 'min'
    })
  }

  if (validation && validation.max !== undefined && value.length > validation.max) {
    errors.push({
      field: question.id,
      message: `Please select at most ${validation.max} option${validation.max !== 1 ? 's' : ''}`,
      type: 'max'
    })
  }
}

/**
 * Validates file upload responses
 */
function validateFileResponse(
  question: Question,
  value: File | { name: string; size: number; type: string },
  validation: ValidationRule,
  errors: ValidationError[]
): void {
  if (!value || !value.name) {
    return // File validation only applies if file is present
  }

  // File type validation
  if (validation.fileTypes && validation.fileTypes.length > 0) {
    const fileExtension = value.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = validation.fileTypes.map(type => type.toLowerCase().replace('.', ''))
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      errors.push({
        field: question.id,
        message: `Allowed file types: ${validation.fileTypes.join(', ')}`,
        type: 'fileType'
      })
    }
  }

  // File size validation
  if (value.size) {
    const fileSizeMB = value.size / (1024 * 1024)
    
    if (validation.maxFileSize && fileSizeMB > validation.maxFileSize) {
      errors.push({
        field: question.id,
        message: `File size must be less than ${validation.maxFileSize}MB`,
        type: 'fileSize'
      })
    }

    if (validation.minFileSize && fileSizeMB < validation.minFileSize) {
      errors.push({
        field: question.id,
        message: `File size must be at least ${validation.minFileSize}MB`,
        type: 'fileSize'
      })
    }
  }
}

/**
 * Determines if a question should be shown based on conditional logic
 */
export function shouldShowQuestion(
  question: Question,
  allResponses: Record<string, any>
): boolean {
  if (!question.conditionalLogic) {
    return true
  }

  const rule = question.conditionalLogic
  const dependentValue = allResponses[rule.dependsOn]

  const conditionMet = evaluateCondition(rule.condition, dependentValue, rule.value)

  // Apply the action
  switch (rule.action) {
    case 'show':
      return conditionMet
    case 'hide':
      return !conditionMet
    default:
      return true
  }
}

/**
 * Determines if a question should be required based on conditional logic
 */
export function shouldRequireQuestion(
  question: Question,
  allResponses: Record<string, any>
): boolean {
  // Base requirement
  let isRequired = question.required

  if (question.conditionalLogic && question.conditionalLogic.action === 'require') {
    const rule = question.conditionalLogic
    const dependentValue = allResponses[rule.dependsOn]
    const conditionMet = evaluateCondition(rule.condition, dependentValue, rule.value)
    isRequired = isRequired || conditionMet
  }

  return isRequired
}

/**
 * Determines if a question should be disabled based on conditional logic
 */
export function shouldDisableQuestion(
  question: Question,
  allResponses: Record<string, any>
): boolean {
  if (question.conditionalLogic && question.conditionalLogic.action === 'disable') {
    const rule = question.conditionalLogic
    const dependentValue = allResponses[rule.dependsOn]
    return evaluateCondition(rule.condition, dependentValue, rule.value)
  }

  return false
}

/**
 * Evaluates a conditional rule
 */
function evaluateCondition(
  condition: ConditionalRule['condition'],
  actualValue: any,
  expectedValue: any
): boolean {
  switch (condition) {
    case 'equals':
      return actualValue === expectedValue
    case 'not_equals':
      return actualValue !== expectedValue
    case 'contains':
      return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase())
    case 'not_contains':
      return !String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase())
    case 'greater_than':
      return Number(actualValue) > Number(expectedValue)
    case 'less_than':
      return Number(actualValue) < Number(expectedValue)
    case 'greater_equal':
      return Number(actualValue) >= Number(expectedValue)
    case 'less_equal':
      return Number(actualValue) <= Number(expectedValue)
    case 'is_empty':
      return isEmpty(actualValue)
    case 'is_not_empty':
      return !isEmpty(actualValue)
    default:
      return false
  }
}

/**
 * Checks if a value is considered empty
 */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  // Don't treat empty arrays as empty for multi-choice questions - they should be validated
  if (typeof value === 'object' && !Array.isArray(value)) return Object.keys(value).length === 0
  return false
}

/**
 * Validates all questions in an assessment
 */
export function validateAssessmentResponses(
  questions: Question[],
  responses: Record<string, any>
): Record<string, ValidationError[]> {
  const validationResults: Record<string, ValidationError[]> = {}

  for (const question of questions) {
    const errors = validateQuestionResponse(question, responses[question.id], responses)
    if (errors.length > 0) {
      validationResults[question.id] = errors
    }
  }

  return validationResults
}

/**
 * Gets all visible questions based on conditional logic
 */
export function getVisibleQuestions(
  questions: Question[],
  responses: Record<string, any>
): Question[] {
  return questions.filter(question => shouldShowQuestion(question, responses))
}

/**
 * Gets all required questions based on conditional logic
 */
export function getRequiredQuestions(
  questions: Question[],
  responses: Record<string, any>
): Question[] {
  return questions.filter(question => 
    shouldShowQuestion(question, responses) && shouldRequireQuestion(question, responses)
  )
}