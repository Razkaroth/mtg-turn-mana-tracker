import React from 'react';
import { PlayerData } from '../../types';
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerSelectorProps {
  players: PlayerData[];
  displayedPlayerIndex: number;
  activePlayerIndex: number;
  onSelectPlayer: (index: number) => void;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  displayedPlayerIndex,
  activePlayerIndex,
  onSelectPlayer,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSelector = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectPlayer = (index: number) => {
    onSelectPlayer(index);
    setIsOpen(false);
  };

  // Don't render if there's only one player
  if (players.length <= 1) return null;

  return (
    <div className="relative w-full">
      {/* Player selection menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 bg-background border-t border-border/40 shadow-lg rounded-t-lg overflow-hidden"
          >
            <div className="max-h-[40vh] overflow-y-auto p-1 divide-y divide-border/20">
              {players.map((player, index) => (
                <motion.button
                  key={player.id}
                  whileHover={{ backgroundColor: 'rgba(var(--muted), 0.5)' }}
                  onClick={() => handleSelectPlayer(index)}
                  className={`w-full text-left p-3 focus:outline-none transition-colors flex items-center justify-between ${
                    index === displayedPlayerIndex ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {index === activePlayerIndex && (
                      <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-mono">♥</span>
                      {player.life}
                    </span>
                    <span className="h-4 w-px bg-border mx-0.5"></span>
                    <span className="flex items-center gap-1">
                      <span className="font-mono">⚡</span>
                      {Object.values(player.manaPool).reduce((sum, count) => sum + count, 0)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Selector button */}
      <Button
        variant="ghost"
        onClick={toggleSelector}
        className={`w-full flex items-center justify-between rounded-none py-3 h-auto border-none ${
          isOpen ? 'bg-muted' : 'bg-background hover:bg-card/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[150px]">
            {players[displayedPlayerIndex]?.name || "Select Player"}
          </span>
          {displayedPlayerIndex === activePlayerIndex && (
            <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Active
            </span>
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </Button>
    </div>
  );
};

export default PlayerSelector; 