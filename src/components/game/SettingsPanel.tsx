import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useGameStore } from '@/stores/gameStore';
import { GameSettings } from '../../types';
import { Settings, Clock, Heart, Plus, Minus } from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onOpenChange }) => {
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  
  // Function to update a specific setting
  const updateSetting = <K extends keyof GameSettings>(
    key: K, 
    value: GameSettings[K]
  ) => {
    console.log(`Updating setting: ${key} from ${settings[key]} to ${value}`);
    
    // Create a new settings object to ensure it's properly updated
    const newSettings = { ...settings, [key]: value };
    console.log("New settings:", newSettings);
    
    // Update the settings
    updateSettings({ [key]: value });
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg" style={{ padding: "24px" }}>
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Game Settings
          </SheetTitle>
          <SheetDescription>
            Adjust default settings for your games. All changes are automatically saved.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-8 space-y-10">
          {/* Starting Life Points */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-medium">Starting Life</h3>
              </div>
              <div className="font-mono text-xl font-medium">
                {settings.startingLife}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateSetting('startingLife', Math.max(1, settings.startingLife - 1))}
                disabled={settings.startingLife <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Slider
                value={[settings.startingLife]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value: number[]) => updateSetting('startingLife', value[0])}
                className="flex-1"
              />
              
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateSetting('startingLife', Math.min(100, settings.startingLife + 1))}
                disabled={settings.startingLife >= 100}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick set buttons */}
            <div className="flex flex-wrap gap-2">
              {[20, 30, 40, 60].map(value => (
                <Button
                  key={value}
                  variant={settings.startingLife === value ? "default" : "outline"}
                  size="sm"
                  className={settings.startingLife === value ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => updateSetting('startingLife', value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Chess Clock Time */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="text-base font-medium">Chess Clock Time</h3>
              </div>
              <div className="font-mono text-xl font-medium">
                {settings.chessClockMinutes} min
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateSetting('chessClockMinutes', Math.max(1, settings.chessClockMinutes - 1))}
                disabled={settings.chessClockMinutes <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Slider
                value={[settings.chessClockMinutes]}
                min={1}
                max={60}
                step={1}
                onValueChange={(value: number[]) => updateSetting('chessClockMinutes', value[0])}
                className="flex-1"
              />
              
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateSetting('chessClockMinutes', Math.min(60, settings.chessClockMinutes + 1))}
                disabled={settings.chessClockMinutes >= 60}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick set buttons */}
            <div className="flex flex-wrap gap-2">
              {[5, 15, 25, 45].map(value => (
                <Button
                  key={value}
                  variant={settings.chessClockMinutes === value ? "default" : "outline"}
                  size="sm"
                  className={settings.chessClockMinutes === value ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => updateSetting('chessClockMinutes', value)}
                >
                  {value} min
                </Button>
              ))}
            </div>
          </div>
          
          {/* Chess Clock Mode */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <h3 className="text-base font-medium">Chess Clock Mode</h3>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'standard', label: 'Standard' },
                { id: 'fischer', label: 'Fischer' },
                { id: 'bronstein', label: 'Bronstein' }
              ].map(mode => (
                <Button
                  key={mode.id}
                  variant={settings.chessClockMode === mode.id ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 ${settings.chessClockMode === mode.id ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => updateSetting('chessClockMode', mode.id as 'standard' | 'fischer' | 'bronstein')}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {settings.chessClockMode === 'standard' && 
                "Standard timing. Each player has a fixed amount of time for the entire game."}
              {settings.chessClockMode === 'fischer' && 
                "Fischer timing. After each move, a player receives an additional time increment."}
              {settings.chessClockMode === 'bronstein' && 
                "Bronstein timing. A player gets back the time they used for their move, up to a maximum increment."}
            </div>
            
            {/* Time Increment (for Fischer and Bronstein modes) */}
            {settings.chessClockMode !== 'standard' && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Time Increment</h4>
                  <div className="font-mono text-base font-medium">
                    {settings.timeIncrement} sec
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => updateSetting('timeIncrement', Math.max(1, settings.timeIncrement - 1))}
                    disabled={settings.timeIncrement <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Slider
                    value={[settings.timeIncrement]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={(value: number[]) => updateSetting('timeIncrement', value[0])}
                    className="flex-1"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => updateSetting('timeIncrement', Math.min(60, settings.timeIncrement + 1))}
                    disabled={settings.timeIncrement >= 60}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Quick set increment buttons */}
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 30].map(value => (
                    <Button
                      key={value}
                      variant={settings.timeIncrement === value ? "default" : "outline"}
                      size="sm"
                      className={settings.timeIncrement === value ? "bg-primary text-primary-foreground" : ""}
                      onClick={() => updateSetting('timeIncrement', value)}
                    >
                      {value}s
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save Changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel; 