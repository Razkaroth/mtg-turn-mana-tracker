import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, SkipForward, Users } from "lucide-react";
import { useGame } from '../../context/GameContext';

interface PhantomTurnBannerProps {
  onNextTurn: () => void;
}

const PhantomTurnBanner: React.FC<PhantomTurnBannerProps> = ({ onNextTurn }) => {
  const { phantomPlayers } = useGame();
  
  return (
    <Card className="w-full mb-6 border-primary bg-primary/5">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-between space-y-3">
          <div className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Opponents' Phase
            </h2>
            <Ghost className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{phantomPlayers.map(p => p.name).join(', ')}</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            This is your opponents' turn phase. You can play instants or end this phase when ready.
          </p>
          
          <Button 
            onClick={onNextTurn}
            className="mt-2"
            variant="default"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Begin Your Turn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhantomTurnBanner; 