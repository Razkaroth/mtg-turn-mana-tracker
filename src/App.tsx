import React from 'react'
import { ThemeProvider } from "@/components/ui/theme-provider"
import { GameProvider } from './context/GameContext'
import { ProfileProvider } from './context/ProfileContext'
import { GameScreen } from './components/game/GameScreen'
import { MainMenu } from './components/menu/MainMenu'
import { useGame } from './context/GameContext'
import { Toaster } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'

// Wrapper component to access the game context
const GameContainer: React.FC = () => {
  const { gameStarted } = useGame();
  
  return gameStarted ? <GameScreen /> : <MainMenu />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="auto-magic-ator-theme">
      <TooltipProvider>
        <ProfileProvider>
          <GameProvider>
            <GameContainer />
          </GameProvider>
        </ProfileProvider>
      </TooltipProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}

export default App
