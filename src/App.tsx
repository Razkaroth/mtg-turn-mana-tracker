import React, { Component, ErrorInfo } from 'react'
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ProfileProvider } from './context/ProfileContext'
import { Toaster } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { GameContainer } from './components/game/GameContainer'
import { Button } from './components/ui/button'
import { toast } from 'sonner'

// Error boundary to catch any unhandled errors in the app
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
          <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg border border-border">
            <h1 className="text-xl font-semibold text-primary mb-4">Oops, something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted rounded overflow-auto max-h-[150px]">
              {this.state.error?.stack}
            </div>
            <Button 
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="w-full"
            >
              Reload Application
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  // Add global error handler for unhandled promises
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      toast.error('Operation failed', {
        description: event.reason?.message || 'An unexpected error occurred',
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="auto-magic-ator-theme">
        <TooltipProvider>
          <ProfileProvider>
            <GameContainer />
          </ProfileProvider>
        </TooltipProvider>
        <Toaster position="bottom-center" richColors />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
