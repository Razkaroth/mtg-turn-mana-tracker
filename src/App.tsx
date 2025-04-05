import React from 'react'
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ProfileProvider } from './context/ProfileContext'
import { Toaster } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { GameContainer } from './components/game/GameContainer'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="auto-magic-ator-theme">
      <TooltipProvider>
        <ProfileProvider>
          <GameContainer />
        </ProfileProvider>
      </TooltipProvider>
      <Toaster position="bottom-center" richColors />
    </ThemeProvider>
  )
}

export default App
