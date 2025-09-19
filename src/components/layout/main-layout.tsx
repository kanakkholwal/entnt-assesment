import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ToastProvider } from "@/components/ui/toast-provider"
import { ThemeProvider } from "next-themes"
import Header from "@/components/Header"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </ErrorBoundary>
        <ToastProvider />
      </div>
    </ThemeProvider>
  )
}