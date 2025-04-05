import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, User, Eye } from 'lucide-react';
import { PlayerData } from '@/types';

interface PlayerSelectorProps {
  players: PlayerData[];
  selectedIndex: number;
  activePlayerIndex: number;
  onSelectPlayer: (index: number) => void;
  disabled?: boolean;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  selectedIndex,
  activePlayerIndex,
  onSelectPlayer,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ensure selectedIndex is valid
  const safeSelectedIndex = useMemo(() => {
    return selectedIndex >= 0 && selectedIndex < players.length 
      ? selectedIndex 
      : 0;
  }, [selectedIndex, players.length]);
  
  const toggleMenu = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);
  
  const handleSelectPlayer = useCallback((index: number) => {
    if (index !== selectedIndex) {
      onSelectPlayer(index);
    }
    setIsOpen(false);
  }, [onSelectPlayer, selectedIndex]);
  
  // Memoize the player buttons to prevent unnecessary re-renders
  const playerButtons = useMemo(() => {
    return players.map((player, index) => (
      <motion.button
        key={player.id}
        onClick={() => handleSelectPlayer(index)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
          index === safeSelectedIndex 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'hover:bg-muted/50'
        } ${
          index === activePlayerIndex 
            ? 'border-l-2 border-primary pl-[10px]' 
            : ''
        }`}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.1 }}
      >
        {index === safeSelectedIndex ? (
          <Eye className="h-3.5 w-3.5 text-primary" />
        ) : (
          <User className={`h-3.5 w-3.5 ${
            index === activePlayerIndex 
              ? 'text-primary' 
              : 'text-muted-foreground'
          }`} />
        )}
        
        <span>{player.name}</span>
        
        {player.isPhantom && (
          <span className="ml-1 text-xs text-muted-foreground">(Remote)</span>
        )}
        
        {index === activePlayerIndex && (
          <span className="ml-auto text-xs text-primary font-medium">Active</span>
        )}
      </motion.button>
    ));
  }, [players, safeSelectedIndex, activePlayerIndex, handleSelectPlayer]);
  
  // Render nothing if less than 2 players
  if (players.length < 2) return null;
  
  return (
    <div className="my-4 relative">
      <Button
        variant="outline"
        onClick={toggleMenu}
        disabled={disabled}
        className={`w-full bg-muted/50 justify-between text-sm items-center h-10 border-border/50 ${
          disabled ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">View Player:</span>
          <span className="font-medium">
            {players[safeSelectedIndex]?.name || 'Select Player'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card/95 backdrop-blur-sm shadow-lg"
          >
            <div className="py-1 max-h-[200px] overflow-y-auto">
              {playerButtons}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(PlayerSelector); 