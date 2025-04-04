import React from 'react';
import { Button } from "@/components/ui/button";
import { SkipForward, Ghost } from "lucide-react";
import { motion } from "framer-motion";

interface PhantomTurnBannerProps {
  onNextTurn: () => void;
}

const PhantomTurnBanner: React.FC<PhantomTurnBannerProps> = ({ onNextTurn }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-4 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/20 to-indigo-400/30" />
        
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100/80 dark:bg-blue-900/30 p-1.5 rounded-md">
            <Ghost className="h-5 w-5 text-blue-600/70 dark:text-blue-400/70" />
          </div>
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">Opponents' Phase</h3>
        </div>
        
        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-3">
          Your opponents are taking their turns. You can:
        </p>
        
        <ul className="text-sm text-blue-600/90 dark:text-blue-400/90 mb-4 space-y-1.5 pl-5 list-disc">
          <li>Cast instants and activated abilities</li>
          <li>Mentally prepare for your next turn</li>
          <li><b>Reading</b> what your cards do</li>
        </ul>
        
        <div className="flex justify-end">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={onNextTurn}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none text-white shadow-sm"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Begin Your Turn
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhantomTurnBanner; 