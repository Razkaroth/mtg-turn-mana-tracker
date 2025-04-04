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
import { useGame } from '../../context/GameContext';
import { GameSettings } from '../../types';
import { Settings, Clock, Heart, Plus, Minus } from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onOpenChange }) => {
  const { settings, updateSettings } = useGame();
  
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
        </div>
        
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel; 