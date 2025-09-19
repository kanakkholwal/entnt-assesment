import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Button } from "./button"
import { LoadingSpinner } from "./loading-spinner"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  description?: string
}

export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className,
  description 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn("text-sm font-medium", required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label: string
  error?: string
  required?: boolean
  description?: string
}

export function FormInput({ 
  label, 
  error, 
  required, 
  description, 
  className,
  ...props 
}: FormInputProps) {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required}
      description={description}
    >
      <Input 
        className={cn(error && "border-destructive", className)}
        {...props}
      />
    </FormField>
  )
}

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  label: string
  error?: string
  required?: boolean
  description?: string
}

export function FormTextarea({ 
  label, 
  error, 
  required, 
  description, 
  className,
  ...props 
}: FormTextareaProps) {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required}
      description={description}
    >
      <Textarea 
        className={cn(error && "border-destructive", className)}
        {...props}
      />
    </FormField>
  )
}

interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: "left" | "right" | "center"
}

export function FormActions({ children, className, align = "right" }: FormActionsProps) {
  const alignClasses = {
    left: "justify-start",
    right: "justify-end", 
    center: "justify-center"
  }

  return (
    <div className={cn("flex items-center gap-2", alignClasses[align], className)}>
      {children}
    </div>
  )
}

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean
  loadingText?: string
}

export function SubmitButton({ 
  isLoading, 
  loadingText = "Saving...", 
  children, 
  disabled,
  ...props 
}: SubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? loadingText : children}
    </Button>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

interface FormGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {children}
    </div>
  )
}