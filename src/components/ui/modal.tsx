import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { Button } from "./button"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

interface ModalTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function ModalTrigger({ children, asChild }: ModalTriggerProps) {
  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
}

interface ModalContentProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function ModalContent({ children, className, size = "md" }: ModalContentProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4"
  }

  return (
    <DialogContent className={cn(sizeClasses[size], className)}>
      {children}
    </DialogContent>
  )
}

interface ModalHeaderProps {
  title: string
  description?: string
  className?: string
}

export function ModalHeader({ title, description, className }: ModalHeaderProps) {
  return (
    <DialogHeader className={className}>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>
  )
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return <DialogFooter className={className}>{children}</DialogFooter>
}

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  isLoading = false
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error handling should be done by the parent component
      console.error("Confirm action failed:", error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader title={title} description={description} />
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" />}
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit?: () => void | Promise<void>
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  size = "md"
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      try {
        await onSubmit()
        onOpenChange(false)
      } catch (error) {
        // Error handling should be done by the parent component
        console.error("Form submission failed:", error)
      }
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size={size}>
        <form onSubmit={handleSubmit}>
          <ModalHeader title={title} description={description} />
          <div className="py-4">{children}</div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" />}
              {submitText}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}