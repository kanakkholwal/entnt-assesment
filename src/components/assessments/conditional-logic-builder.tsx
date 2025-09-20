import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import type { ConditionalRule, Question } from '@/types/assessment'

interface ConditionalLogicBuilderProps {
  rule?: ConditionalRule
  availableQuestions: Question[]
  onChange: (rule?: ConditionalRule) => void
}

const CONDITIONS = [
  { value: 'equals', label: 'Equals', description: 'Value equals exactly' },
  { value: 'not_equals', label: 'Not Equals', description: 'Value does not equal' },
  { value: 'contains', label: 'Contains', description: 'Text contains substring' },
  { value: 'not_contains', label: 'Not Contains', description: 'Text does not contain' },
  { value: 'greater_than', label: 'Greater Than', description: 'Number is greater than' },
  { value: 'less_than', label: 'Less Than', description: 'Number is less than' },
  { value: 'greater_equal', label: 'Greater or Equal', description: 'Number is greater than or equal' },
  { value: 'less_equal', label: 'Less or Equal', description: 'Number is less than or equal' },
  { value: 'is_empty', label: 'Is Empty', description: 'Field is empty or not answered' },
  { value: 'is_not_empty', label: 'Is Not Empty', description: 'Field has a value' }
] as const

const ACTIONS = [
  { value: 'show', label: 'Show Question', description: 'Show this question when condition is met' },
  { value: 'hide', label: 'Hide Question', description: 'Hide this question when condition is met' },
  { value: 'require', label: 'Make Required', description: 'Make this question required when condition is met' },
  { value: 'disable', label: 'Disable Question', description: 'Disable this question when condition is met' }
] as const

export function ConditionalLogicBuilder({ 
  rule, 
  availableQuestions, 
  onChange 
}: ConditionalLogicBuilderProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleAddRule = () => {
    if (availableQuestions.length === 0) return
    
    const newRule: ConditionalRule = {
      dependsOn: availableQuestions[0].id,
      condition: 'equals',
      value: '',
      action: 'show'
    }
    onChange(newRule)
    setIsEditing(true)
  }

  const handleUpdateRule = (updates: Partial<ConditionalRule>) => {
    if (!rule) return
    onChange({ ...rule, ...updates })
  }

  const handleRemoveRule = () => {
    onChange(undefined)
    setIsEditing(false)
  }

  const getDependentQuestion = () => {
    return availableQuestions.find(q => q.id === rule?.dependsOn)
  }

  const needsValue = rule?.condition && !['is_empty', 'is_not_empty'].includes(rule.condition)

  if (!rule && !isEditing) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground  mb-3">
          No conditional logic set
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRule}
          disabled={availableQuestions.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Conditional Logic
        </Button>
        {availableQuestions.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Add more questions to enable conditional logic
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Conditional Logic
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon_sm"
            onClick={handleRemoveRule}
            className="p-0 text-red-600 hover:text-red-700"
          >
            <X />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Dependent Question */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground ">
              When Question
            </Label>
            <Select
              value={rule?.dependsOn || ''}
              onValueChange={(value) => handleUpdateRule({ dependsOn: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a question..." />
              </SelectTrigger>
              <SelectContent>
                {availableQuestions.map((question) => (
                  <SelectItem key={question.id} value={question.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{question.title}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {question.type.replace('-', ' ')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground ">
              Condition
            </Label>
            <Select
              value={rule?.condition || ''}
              onValueChange={(value) => handleUpdateRule({ condition: value as ConditionalRule['condition'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select condition..." />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{condition.label}</span>
                      <span className="text-xs text-gray-500">{condition.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value (if needed) */}
          {needsValue && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground ">
                Value
              </Label>
              {getDependentQuestion()?.type === 'single-choice' && getDependentQuestion()?.options ? (
                <Select
                  value={rule?.value || ''}
                  onValueChange={(value) => handleUpdateRule({ value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getDependentQuestion()!.options!.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : getDependentQuestion()?.type === 'numeric' ? (
                <Input
                  type="number"
                  value={rule?.value || ''}
                  onChange={(e) => handleUpdateRule({ value: Number(e.target.value) })}
                  placeholder="Enter number..."
                  className="mt-1"
                />
              ) : (
                <Input
                  value={rule?.value || ''}
                  onChange={(e) => handleUpdateRule({ value: e.target.value })}
                  placeholder="Enter value..."
                  className="mt-1"
                />
              )}
            </div>
          )}

          {/* Action */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground ">
              Then
            </Label>
            <Select
              value={rule?.action || ''}
              onValueChange={(value) => handleUpdateRule({ action: value as ConditionalRule['action'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-gray-500">{action.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rule Summary */}
        {rule?.dependsOn && rule?.condition && rule?.action && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Rule:</strong> When "{getDependentQuestion()?.title}" {CONDITIONS.find(c => c.value === rule.condition)?.label.toLowerCase()}{' '}
              {needsValue && rule.value && `"${rule.value}"`}, then {ACTIONS.find(a => a.value === rule.action)?.label.toLowerCase()}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}