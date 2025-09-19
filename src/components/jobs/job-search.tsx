import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/use-debounce'

interface JobSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function JobSearch({ value, onChange, placeholder = "Search jobs..." }: JobSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)

  // Update local state when external value changes
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== value) {
      onChange(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, onChange, value])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}