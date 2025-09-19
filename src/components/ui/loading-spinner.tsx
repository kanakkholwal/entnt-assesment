import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  height?: string
}

export function LoadingSkeleton({ className, lines = 1, height = "h-4" }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("bg-muted animate-pulse rounded", height)}
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("p-6 border rounded-lg space-y-4", className)}>
      <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 bg-muted animate-pulse rounded w-20" />
        <div className="h-8 bg-muted animate-pulse rounded w-16" />
      </div>
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted animate-pulse rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-muted/60 animate-pulse rounded flex-1"
              style={{
                animationDelay: `${(rowIndex * columns + colIndex) * 100}ms`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

interface LoadingListProps {
  items?: number
  className?: string
}

export function LoadingList({ items = 5, className }: LoadingListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-3 bg-muted/60 animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface LoadingPageProps {
  className?: string
}

export function LoadingPage({ className }: LoadingPageProps) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-4 bg-muted/60 animate-pulse rounded w-1/2" />
      </div>
      
      {/* Content */}
      <div className="grid gap-6">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </div>
  )
}