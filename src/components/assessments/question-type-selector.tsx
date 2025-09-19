import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  Hash,
  Upload
} from 'lucide-react'
import type { QuestionType } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface QuestionTypeSelectorProps {
  value: QuestionType
  onChange: (type: QuestionType) => void
  className?: string
}

const QUESTION_TYPES: Array<{
  value: QuestionType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    value: 'short-text',
    label: 'Short Text',
    description: 'Single line text input',
    icon: Type
  },
  {
    value: 'long-text',
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: AlignLeft
  },
  {
    value: 'single-choice',
    label: 'Single Choice',
    description: 'Radio buttons - select one option',
    icon: Circle
  },
  {
    value: 'multi-choice',
    label: 'Multiple Choice',
    description: 'Checkboxes - select multiple options',
    icon: CheckSquare
  },
  {
    value: 'numeric',
    label: 'Numeric',
    description: 'Number input with validation',
    icon: Hash
  },
  {
    value: 'file-upload',
    label: 'File Upload',
    description: 'File attachment input',
    icon: Upload
  }
]

export function QuestionTypeSelector({ value, onChange, className }: QuestionTypeSelectorProps) {
  const selectedType = QUESTION_TYPES.find(type => type.value === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue>
          {selectedType && (
            <div className="flex items-center gap-2">
              <selectedType.icon className="h-4 w-4 text-gray-500" />
              <span>{selectedType.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {QUESTION_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className="flex items-start gap-3 py-1">
              <type.icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}