import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Breadcrumbs } from "@/components/Breadcrumbs"

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  showBreadcrumbs?: boolean
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  actions, 
  className,
  showBreadcrumbs = true
}: PageLayoutProps) {
  return (
    <div className={cn("flex flex-col space-y-6 p-6", className)}>
      {showBreadcrumbs && <Breadcrumbs />}
      
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <ErrorBoundary>
        <div className="flex-1">{children}</div>
      </ErrorBoundary>
    </div>
  )
}

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Container({ children, className, size = "lg" }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full"
  }

  return (
    <div className={cn("mx-auto w-full", sizeClasses[size], className)}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export function Section({ children, className, title, description }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-medium">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}