import React from 'react'
import { ThemeProvider } from "@/components/ui/theme-provider"
import { GameProvider } from './context/GameContext'
import { ProfileProvider } from './context/ProfileContext'
import { GameScreen } from './components/game/GameScreen'
import { MainMenu } from './components/menu/MainMenu'
import { useGame } from './context/GameContext'
import { Toaster } from 'sonner'

// Wrapper component to access the game context
const GameContainer: React.FC = () => {
  const { gameStarted } = useGame();
  
  return gameStarted ? <GameScreen /> : <MainMenu />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mtg-companion-theme">
      <ProfileProvider>
        <GameProvider>
          <GameContainer />
        </GameProvider>
      </ProfileProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}

export default App
