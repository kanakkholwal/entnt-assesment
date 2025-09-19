import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'

interface CandidateSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CandidateSearch({ 
  value, 
  onChange, 
  placeholder = "Search candidates by name or email...",
  className 
}: CandidateSearchProps) {
  const [localValue, setLocalValue] = useState(value)
  
  // Debounce the search to avoid excessive API calls
  useDebounce(
    () => {
      if (localValue !== value) {
        onChange(localValue)
      }
    },
    300,
    [localValue]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  )
}