import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook that debounces a callback function
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array (similar to useEffect)
 */
export function useDebounce(
  callback: () => void,
  delay: number,
  deps: React.DependencyList
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(callback, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, deps)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}

/**
 * Custom hook that returns a debounced value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}